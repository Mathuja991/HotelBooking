import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  coverImage: String, // ✅ single URL for cover image
  media: [
    {
      url: String,
      type: { type: String, enum: ["image", "video"], required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Event", eventSchema);