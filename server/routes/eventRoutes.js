import express from "express";
import { createEvent, getEvents } from "../controller/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import parser from "../configs/multer.js";

const router = express.Router();

// Upload multiple files
router.post("/create", protect, parser.array("mediaFiles"), createEvent);
router.get("/all", getEvents);

export default router;
