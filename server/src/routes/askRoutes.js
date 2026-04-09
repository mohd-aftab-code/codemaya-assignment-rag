import express from "express";
import { ask, getAskHistory } from "../controllers/askController.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { askRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/", authenticate, askRateLimiter, asyncHandler(ask));
router.get("/history", authenticate, asyncHandler(getAskHistory));

export default router;
