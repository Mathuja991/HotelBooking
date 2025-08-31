import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    media: [{ type: String }], // store array of Cloudinary URLs
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
