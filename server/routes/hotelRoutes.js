import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel } from "../controller/hotelController.js";

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

export default hotelRouter;
