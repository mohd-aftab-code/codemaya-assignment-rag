import express from "express";
import cors from "cors";
import docRoutes from "./src/routes/docRoutes.js";
import askRoutes from "./src/routes/askRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import {
  errorHandler,
  notFound
} from "./src/middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/ask", askRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
