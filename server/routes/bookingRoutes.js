import express from "express";
import { requireAuth } from "@clerk/express";
import {
checkAvailabilityAPI,
createBooking,




} from '../controller/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/check-availability", requireAuth, checkAvailabilityAPI);
router.post("/book", requireAuth, createBooking);
//router.get("/my-bookings", requireAuth, getUserBookings);

export default router