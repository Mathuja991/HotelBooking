import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import sendEmail from '../configs/nodemailer.js';

// --- Utility: Check Room Availability ---
export const checkAvailability = async ({ room, checkInDate, startTime, endTime }) => {
  try {
    const checkDate = new Date(checkInDate);

    // Find overlapping bookings for the same room and day
    const overlappingBookings = await Booking.find({
      room,
      checkInDate: checkDate,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    return overlappingBookings.length === 0; // true if no overlap
  } catch (error) {
    console.error("Check Availability Error:", error);
    throw new Error("Failed to check room availability");
  }
};

// --- API: Check Availability ---
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, startTime, endTime } = req.body;

    if (!room || !checkInDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const isAvailable = await checkAvailability({ room, checkInDate, startTime, endTime });

    res.json({ success: true, isAvailable });
  } catch (error) {
    console.error("Check Availability API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- API: Create Booking ---
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, startTime, endTime, guests, guestName, phoneNumber, paymentMethod } = req.body;

    // Clerk user ID
    const userId = req?.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // basic validation
    if (!room || !checkInDate || !startTime || !endTime || !guests || !guestName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: "End time must be after start time" });
    }

    // room & hotel
    const roomDoc = await Room.findById(room).populate("hotel");
    if (!roomDoc) return res.status(404).json({ success: false, message: "Room not found" });
    const hotelId = roomDoc.hotel?._id;
    if (!hotelId) return res.status(400).json({ success: false, message: "Room is not linked to a hotel" });

    // normalize check-in date
    const checkDate = new Date(checkInDate);
    checkDate.setHours(0, 0, 0, 0);

    // availability
    const isAvailable = await checkAvailability({ room, checkInDate: checkDate, startTime, endTime });
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Room not available for this time" });
    }

    // simple pricing (adjust as desired)
    // if you price per day, use pricePerNight
    // if you price per hour, calculate hours from start-end
    const pricePerDay = roomDoc.pricePerNight || 0;
    const totalPrice = pricePerDay; // keep simple; adapt to your business rules

    const booking = await Booking.create({
      user: userId,
      room,
      hotel: hotelId,
      checkInDate: checkDate,
      startTime,
      endTime,
      totalPrice,
      guests,
      guestName,
      status: "pending",
      paymentMethod: paymentMethod || "Pay At Hotel",
      isPaid: false,
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return res.status(500).json({ success: false, message: "Booking failed" });
  }
};


// --- API: Get Hotel Bookings ---
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "No Hotel found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings }
    });
  } catch (error) {
    console.error("Get Hotel Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// --- API: Get Owner Rooms with Bookings ---
export const getOwnerRoomsWithBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const hotels = await Hotel.find({ owner: ownerId });
    if (hotels.length === 0) return res.json({ success: true, rooms: [] });

    const hotelIds = hotels.map(h => h._id);
    const rooms = await Room.find({ hotel: { $in: hotelIds } });
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('user', 'firstName email')
      .populate('room', 'roomType');

    const roomsWithBookings = rooms.map(room => {
      const roomBookings = bookings
        .filter(b => b.room._id.toString() === room._id.toString())
        .map(b => ({
          userName: b.user?.firstName,
          userEmail: b.user?.email,
          checkInDate: b.checkInDate,
          startTime: b.startTime,
          endTime: b.endTime,
          totalPrice: b.totalPrice,
          guests: b.guests,
          status: b.status,
          paymentMethod: b.paymentMethod,
          isPaid: b.isPaid
        }));

      return { ...room.toObject(), bookings: roomBookings };
    });

    res.json({ success: true, rooms: roomsWithBookings });
  } catch (error) {
    console.error("Get Owner Rooms Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- API: Get User Bookings ---
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};
