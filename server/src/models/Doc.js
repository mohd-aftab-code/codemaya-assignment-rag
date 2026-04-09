import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Doc", docSchema);