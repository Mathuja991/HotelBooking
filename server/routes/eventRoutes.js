import express from "express";
import { createEvent, getEvents } from "../controller/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import parser from "../configs/multer.js";

const router = express.Router();

// ✅ handle 1 cover image + multiple extra media
router.post(
  "/create",
  protect,
  parser.fields([
    { name: "image", maxCount: 1 },   // cover
    { name: "media", maxCount: 10 }   // extra
  ]),
  createEvent
);

router.get("/all", getEvents);

export default router;
