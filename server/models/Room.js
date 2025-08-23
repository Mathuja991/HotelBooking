import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hotel: { type: String, ref: "Hotel", required: true },
  roomType: { type: String, required: true },
  capacity: { type: Number, required: true, min: 10, max: 5000 },
  pricePerNight: { type: Number, required: true },
  images: { type: [String], required: true },
  isAvailable: { type: Boolean, default: true },

  lunchMenus: {
    type: [
      {
        menu: { type: String, required: true },   // e.g., "Menu1"
        details: { type: String, required: true }, // e.g., "Rice, Curry"
        price: { type: Number, required: true }    // e.g., 500
      }
    ],
    default: []
  },

  extraCurry: { type: String, default: "" },
  paidCurry: { type: String, default: "" },

  // ✅ Use this instead of amenities
  optionalAddOns: {
    type: [
      {
        name: { type: String, required: true },   // e.g., "Auspicious arrangements"
        price: { type: Number, required: true }   // e.g., 5000
      }
    ],
    default: []
  }
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
