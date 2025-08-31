import express from "express";
import { createEvent, getEvents } from "../controller/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import parser from "../configs/multer.js";

const router = express.Router();

// Upload multiple files with field name "media"
router.post("/create", protect, parser.array("media", 10), createEvent);
router.get("/all", getEvents);

export default router;
