import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  media: [
    {
      url: String,
      type: { type: String, enum: ["image", "video"], required: true } // image or video
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Event", eventSchema);
