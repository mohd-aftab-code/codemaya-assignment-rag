import mongoose from "mongoose";
import dotenv from "dotenv";
import Doc from "./src/models/Doc.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Doc.deleteMany();

await Doc.insertMany([
  {
    title: "Refund Policy",
    content: "Refunds are processed within 5-7 business days.",
    tags: ["refund", "payment"]
  },
  {
    title: "Shipping Policy",
    content: "Shipping takes 3-5 business days.",
    tags: ["shipping"]
  },
  {
    title: "Cancellation",
    content: "Orders can be cancelled within 24 hours.",
    tags: ["cancel"]
  },
  {
    title: "Payment Methods",
    content: "We accept credit card, UPI, and net banking.",
    tags: ["payment"]
  },
  {
    title: "Support",
    content: "You can contact support via email or phone.",
    tags: ["support"]
  }
]);

console.log("Data Seeded");
process.exit();
