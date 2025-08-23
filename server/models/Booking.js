
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      // Clerk userId is a string (e.g., "user_...")
      type: String,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: { type: Date, required: true }, // normalized to midnight
    startTime:   { type: String, required: true }, // "HH:MM"
    endTime:     { type: String, required: true }, // "HH:MM"

    guests: { type: Number, required: true, min: 1 },
    guestName: { type: String, required: true },
    phoneNumber:{ type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Pay At Hotel", "Online"],
      default: "Pay At Hotel",
    },
    isPaid: { type: Boolean, default: false },
     // NEW FIELDS
    lunchMenus: [{ type: String }],          // array of selected lunch menus
    optionalServices: [{ type: String }],    // array of selected extra services
    totalPrice: { type: Number, default: 0 },

  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
