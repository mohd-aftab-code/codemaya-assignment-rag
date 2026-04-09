import mongoose from "mongoose";

const askHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true
    },
    confidence: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low"
    },
    sources: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("AskHistory", askHistorySchema);
