import { messageInRaw } from "svix"
import Hotel from "../models/Hotel.js"
import {v2 as cloudinary} from "cloudinary";
import Room from "../models/Room.js";

import { getAuth } from "@clerk/express";

export const createRoom = async (req, res) => {
    try {
        const { userId } = getAuth(req);  // ✅ Proper way to get the user ID

        if (!userId) return res.json({ success: false, message: "User not authenticated" });

        const { roomType, pricePerNight, amenities } = req.body;

        // ✅ Find hotel by the authenticated owner ID
        const hotel = await Hotel.findOne({ owner: userId });
        if (!hotel) return res.json({ success: false, message: "No Hotel Found" });

        // ✅ Fix Cloudinary upload typo
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path); // corrected cloudinary method
            return response.secure_url;
        });

        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id, // fixed: correct hotel reference
            roomType,
            pricePerNight: +pricePerNight,
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
        const { userId } = getAuth(req);
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


