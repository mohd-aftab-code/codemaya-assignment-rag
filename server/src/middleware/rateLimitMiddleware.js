import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const askRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: {
    message: "Too many ask requests, please try again later.",
    statusCode: 429
  }
});
