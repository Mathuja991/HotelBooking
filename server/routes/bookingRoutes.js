import express from "express";

import {
checkAvailabilityAPI,
createBooking,
getHotelBookings,
getUserBookings,
 getOwnerRoomsWithBookings,
 createManualBooking, 
} from '../controller/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.get('/owner', protect, getOwnerRoomsWithBookings);
bookingRouter.post('/book-manual', protect,  createManualBooking, );
export default bookingRouter