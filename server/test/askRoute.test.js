import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { default: app } = await import("../app.js");

test("POST /api/ask returns 401 without a bearer token", async () => {
  const response = await request(app).post("/api/ask").send({
    question: "What is the refund policy?"
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Authorization token is required");
  assert.equal(response.body.statusCode, 401);
});
