import AskHistory from "../models/AskHistory.js";
import { askQuestion } from "../services/askService.js";
import { logAskRequest } from "../utils/logger.js";
import AppError from "../utils/appError.js";

export const ask = async (req, res) => {
  const { question } = req.body;

  if (!question?.trim()) {
    throw new AppError("Question is required", 400);
  }

  const startedAt = Date.now();
  const result = await askQuestion(question.trim());
  const latency = Date.now() - startedAt;

  if (req.user?.id) {
    await AskHistory.create({
      user: req.user.id,
      question: question.trim(),
      answer: result.answer,
      confidence: result.confidence,
      sources: result.sources
    });
  }

  logAskRequest({
    userId: req.user?.id,
    question: question.trim(),
    latency,
    confidence: result.confidence
  });

  res.json({
    ...result,
    latency
  });
};

export const getAskHistory = async (req, res) => {
  const history = await AskHistory.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("question answer confidence sources createdAt");

  res.json(history);
};
