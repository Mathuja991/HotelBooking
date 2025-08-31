import Event from "../models/eventModel.js";


import { v2 as cloudinary } from "cloudinary";


export const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    let mediaUrls = [];

    // Handle uploaded files from multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedResponse = await cloudinary.uploader.upload(file.path, {
          folder: "events",
        });
        mediaUrls.push(uploadedResponse.secure_url);
      }
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      media: mediaUrls, // Save multiple images
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
