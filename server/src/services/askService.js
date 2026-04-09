import "dotenv/config";
import Doc from "../models/Doc.js";
import OpenAI from "openai";
import { z } from "zod";
import AppError from "../utils/appError.js";

let openai;

const askResponseSchema = z.object({
  answer: z.string().min(1),
  sources: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"])
});

const normalizeText = (value = "") => value.toLowerCase().trim();

const getQuestionTerms = (question) =>
  normalizeText(question)
    .split(/\s+/)
    .filter((term) => term.length > 1);

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError(
      "OPENAI_API_KEY is missing. Add it to server/.env and restart the server.",
      500
    );
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openai;
};

const buildFallbackResponse = (relevantDocs) => ({
  answer: relevantDocs[0]?.content || "Not available in documents",
  sources: relevantDocs.map((doc) => doc._id.toString()),
  confidence: relevantDocs.length > 1 ? "medium" : "low"
});

const shouldUseFallback = (error) =>
  error?.status === 429 ||
  error?.code === "insufficient_quota" ||
  error?.code === "rate_limit_exceeded";

const parseModelResponse = (content, relevantDocs) => {
  try {
    const parsed = JSON.parse(content);
    const validated = askResponseSchema.parse({
      answer: parsed.answer || "Not available in documents",
      sources:
        Array.isArray(parsed.sources) && parsed.sources.length > 0
          ? parsed.sources
          : relevantDocs.map((doc) => doc._id.toString()),
      confidence: parsed.confidence || "low"
    });

    return validated;
  } catch (error) {
    return buildFallbackResponse(relevantDocs);
  }
};

const scoreDocument = (doc, question, questionTerms) => {
  const title = normalizeText(doc.title);
  const content = normalizeText(doc.content);
  const tags = Array.isArray(doc.tags)
    ? doc.tags.map((tag) => normalizeText(tag))
    : [];
  const normalizedQuestion = normalizeText(question);

  let score = 0;

  if (title.includes(normalizedQuestion)) {
    score += 6;
  }

  if (content.includes(normalizedQuestion)) {
    score += 4;
  }

  if (tags.some((tag) => tag.includes(normalizedQuestion))) {
    score += 5;
  }

  for (const term of questionTerms) {
    if (title.includes(term)) {
      score += 3;
    }

    if (content.includes(term)) {
      score += 1;
    }

    if (tags.some((tag) => tag.includes(term))) {
      score += 2;
    }
  }

  return score;
};

export const askQuestion = async (question) => {
  const openai = getOpenAIClient();
  const questionTerms = getQuestionTerms(question);

  // 1. Fetch all documents
  const docs = await Doc.find();

  // 2. Find relevant documents using title, content, and tags
  const relevantDocs = docs
    .map((doc) => ({
      doc,
      score: scoreDocument(doc, question, questionTerms)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.doc)
    .slice(0, 3);

  // 3. If no relevant data found
  if (relevantDocs.length === 0) {
    return askResponseSchema.parse({
      answer: "Not available in documents",
      sources: [],
      confidence: "low"
    });
  }

  // 4. Create context from docs
  const context = relevantDocs
    .map(
      (doc) =>
        `Document ID: ${doc._id.toString()}\nTitle: ${doc.title}\nContent: ${doc.content}`
    )
    .join("\n\n");
  const sources = relevantDocs.map((doc) => doc._id.toString());

  // 5. Create prompt
  const prompt = `
You are an AI assistant.

Answer ONLY from the given context.
If the answer is not present, say "Not available in documents".

Context:
${context}

Question:
${question}

Return response in JSON format:
{
  "answer": "...",
  "sources": ${JSON.stringify(sources)},
  "confidence": "high | medium | low"
}
`;

  // 6. Call OpenAI
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.choices[0].message.content || "{}";

    return parseModelResponse(content, relevantDocs);
  } catch (error) {
    if (shouldUseFallback(error)) {
      return askResponseSchema.parse(buildFallbackResponse(relevantDocs));
    }

    throw new AppError(error.message || "Failed to generate answer", 500);
  }
};
