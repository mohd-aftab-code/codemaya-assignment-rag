import Doc from "../models/Doc.js";

export const getDocuments = async (req, res) => {
  const docs = await Doc.find().sort({ createdAt: -1 });
  res.json(docs);
};
