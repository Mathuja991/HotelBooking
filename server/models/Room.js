import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: { type: String, ref: "Hotel", required: true },
    roomType: { type: String, required: true },
    capacity: {
        type: Number,
        required: true,
        min: 10,
        max: 5000
    },
    pricePerNight: { type: Number, required: true },
    amenities: { type: Array, required: true },
    images: { type: Array, required: true },
    isAvailable: { type: Boolean, default: true },

    // New fields
    lunchMenus: { type: Array, default: [] }, // [{menu: 'menu1', details: 'Rice, Curry'}]
    extraCurry: { type: String, default: "" },
    paidCurry: { type: String, default: "" },
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
