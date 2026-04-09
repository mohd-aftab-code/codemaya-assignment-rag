import express from "express";
import { getDocuments } from "../controllers/docController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getDocuments));

export default router;
