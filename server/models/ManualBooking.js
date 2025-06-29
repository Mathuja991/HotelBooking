import mongoose from "mongoose";

const manualBookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  guests: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    default: "Pay At Hotel",
  },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

const ManualBooking = mongoose.model("ManualBooking", manualBookingSchema);
export default ManualBooking;
