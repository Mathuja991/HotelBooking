

//import cloudinary from "../config/cloudinary.js";
import { messageInRaw } from "svix";
import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import { getAuth } from "@clerk/express";

// Configure cloudinary with your credentials (make sure .env has these variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) return res.json({ success: false, message: "User not authenticated" });

    const { roomType, pricePerNight,capacity, amenities } = req.body;

    const hotel = await Hotel.findOne({ owner: userId });
    if (!hotel) return res.json({ success: false, message: "No Hotel Found" });

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      capacity,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const getRooms = async (req,res)=>{
    try {
        const rooms = await Room.find({isAvailable: true}).populate({
        path: 'hotel',
        populate: {
        path: 'owner',
        select: 'image'
        }
        }).sort ({createdAt: -1 })
        res. json({success: true, rooms});
        } catch (error) {
        res.json({success: false, message: error.message});
        }

    }


export const getOwnerrooms = async (req, res) => {
    try {
        const userId = req.auth.userId; // ✅ Get userId directly

        const hotelData = await Hotel.findOne({ owner: userId });
        if (!hotelData) return res.json({ success: false, message: "No Hotel Found" });

        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");

        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const toggleRoomAvailability = async (req,res)=>{
        try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
        } catch (error) {
        res.json({success: false, message: error.message});
        }
    }


    export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



