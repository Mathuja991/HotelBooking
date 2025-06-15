import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel, getHotelBookings,getHotelByOwner } from "../controller/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post(
  '/',
  (req, res, next) => {
    console.log('POST /api/hotels hit');
    next();
  },
  protect,
  registerHotel
);
hotelRouter.get('/bookings', protect, getHotelBookings);
hotelRouter.post('/api/hotels/myhotel', protect, getHotelByOwner);
export default hotelRouter;
