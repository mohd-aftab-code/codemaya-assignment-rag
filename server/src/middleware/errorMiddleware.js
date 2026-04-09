import mongoose from "mongoose";
import { logError } from "../utils/logger.js";

const buildMongoError = (error) => {
  if (error.code === 11000) {
    return {
      statusCode: 409,
      message: "Duplicate field value entered"
    };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    return {
      statusCode: 400,
      message
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: `Invalid ${error.path}: ${error.value}`
    };
  }

  return null;
};

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const mongoError = buildMongoError(error);
  const isProduction = process.env.NODE_ENV === "production";

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (mongoError) {
    statusCode = mongoError.statusCode;
    message = mongoError.message;
  }

  logError("request_failed", error, {
    path: req.originalUrl,
    method: req.method,
    statusCode
  });

  const payload = {
    message,
    statusCode
  };

  if (!isProduction) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};
