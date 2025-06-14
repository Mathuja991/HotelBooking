import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.user._id;

        // Check if this user already has a hotel with the same name
        const existingHotel = await Hotel.findOne({ owner, name });
        if (existingHotel) {
            return res.json({ success: false, message: "You already have a hotel with this name." });
        }

        // Create the new hotel
        await Hotel.create({ name, address, contact, city, owner });

        // Update user role to hotelOwner
        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

        res.json({ success: true, message: "Hotel Registered Successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// hotelController.js
export const getHotelBookings = async (req, res) => {
  try {
    const userId = req.user._id; // Changed from req.auth.userId to req.user._id

    // 1. Find hotels owned by user
    const hotels = await Hotel.find({ owner: userId }).select('_id');
    if (!hotels.length) {
      return res.status(200).json({ 
        success: true,
        dashboardData: {
          bookings: [],
          totalBookings: 0,
          totalRevenue: 0
        }
      });
    }

    // Rest of your existing getHotelBookings implementation...
    
    // Modified response format:
    res.status(200).json({
      success: true,
      dashboardData: {
        bookings,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getHotelByOwner = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.status(404).json({ message: 'No hotel found for this user.' });
        }
        res.status(200).json(hotel);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ message: 'Server error fetching hotel.' });
    }
};