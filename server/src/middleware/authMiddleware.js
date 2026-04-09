import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const authenticate = (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return next(new AppError("Authorization token is required", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.id };
  next();
};

export const attachUserIfPresent = (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return next();
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.id };
  next();
};
