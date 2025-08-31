import Event from "../models/eventModel.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No media files uploaded" });
    }

     const image = req.files.map(file => ({
      url: file.path, 
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));

    // Cloudinary-multer already uploaded, so each file has file.path (Cloudinary URL)
    const media = req.files.map(file => ({
      url: file.path, 
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));

    const newEvent = await Event.create({
      title,
      description,
      date,
      image,
      media,   // ✅ save into "media" array
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Event creation failed:", error);
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
};
