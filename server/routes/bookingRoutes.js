import express from "express";
import { requireAuth } from "@clerk/express";
import {
checkAvailabilityAPI,
createBooking,
getHotelBookings,
getUserBookings, 
getOwnerRoomsWithBookings,
getAllBookings,
updatePaymentStatus,
updateBookingStatus,

} from '../controller/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post("/book", requireAuth(), createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.get('/owner', protect, getOwnerRoomsWithBookings);
bookingRouter.get('/all', protect, getAllBookings);
bookingRouter.put("/:id/pay", protect, updatePaymentStatus);




bookingRouter.put("/:id/status", protect, updateBookingStatus);

export default bookingRouter