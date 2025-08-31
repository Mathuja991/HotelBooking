import Event from "../models/eventModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    let mainImageUrl = "";
    const mediaUrls = [];

    // First file = main cover image
    const mainUpload = await cloudinary.uploader.upload(req.files[0].path, {
      folder: "events",
    });
    mainImageUrl = mainUpload.secure_url;

    // Remaining files = extra media (images/videos)
    for (let i = 1; i < req.files.length; i++) {
      const file = req.files[i];

      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "events/media",
        resource_type: "auto", // auto = image/video support
      });

      mediaUrls.push(upload.secure_url);
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      image: mainImageUrl,
      media: mediaUrls,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Event creation failed:", error);
    res.status(500).json({ message: "Failed to create event", error });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
  }
};
