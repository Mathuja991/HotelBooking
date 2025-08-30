import Event from "../models/eventModel.js";


export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;

    const media = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));

    const newEvent = new Event({ title, description, media });
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating event", error: err.message });
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
