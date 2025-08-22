import Booking from "../models/Bookings.js";
import Room from "../models/Room.js";

// --- Check Room Availability ---
export const checkAvailability = async ({ room, checkInDate, startTime, endTime }) => {
  const bookings = await Booking.find({
    room,
    checkInDate: new Date(checkInDate),
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
  return bookings.length === 0;
};

// --- API: Create Booking ---
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, startTime, endTime, guests, guestName, phoneNumber, paymentMethod } = req.body;

    if (!room || !checkInDate || !startTime || !endTime || !guestName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Make sure room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) return res.status(404).json({ success: false, message: "Room not found" });

    // Create booking
    const booking = await Booking.create({
      user: req.auth.userId, // comes from auth middleware
      room,
      checkInDate,
      startTime,
      endTime,
      guests,
      guestName,
      phoneNumber,
      paymentMethod: paymentMethod || "Pay At Hotel",
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
    return res.json({ success: true, isAvailable });
  } catch (error) {
    console.error("Check Availability Error:", error);
    return res.status(500).json({ success: false, message: "Failed to check availability" });
  }
};

// --- API: Get User Bookings ---
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("room").sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};
