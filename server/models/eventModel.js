import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, required: true }, // main image
    media: [{ type: String }], // extra images/videos
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
