import Event from "../models/eventModel.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!req.files || (!req.files.image && !req.files.media)) {
      return res.status(400).json({ message: "No media files uploaded" });
    }

    // ✅ cover image (optional but usually required)
    const coverImage = req.files.image
      ? req.files.image[0].path
      : null;

    // ✅ extra media
    const media = req.files.media
      ? req.files.media.map((file) => ({
          url: file.path,
          type: file.mimetype.startsWith("video") ? "video" : "image",
        }))
      : [];

    const newEvent = await Event.create({
      title,
      description,
      date,
      coverImage,
      media,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Event creation failed:", error);
    res
      .status(500)
      .json({ message: "Failed to create event", error: error.message });
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


export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching event" });
  }
};
