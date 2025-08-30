import express from "express";
import { createEvent, getEvents } from "../controller/eventController.js";
import { protect } from "../middleware/authMiddleware.js"; // protect admin routes

const router = express.Router();

router.post("/create", protect, createEvent);  // admin only
router.get("/all", getEvents);                 // public for users

export default router;
