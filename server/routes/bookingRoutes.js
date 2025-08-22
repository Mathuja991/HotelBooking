import express from "express";
import { requireAuth } from "@clerk/express";
import {
checkAvailabilityAPI,
createBooking,
getHotelBookings,

 getOwnerRoomsWithBookings,

} from '../controller/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post("/book", requireAuth(), createBooking);

bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.get('/owner', protect, getOwnerRoomsWithBookings);

export default bookingRouter