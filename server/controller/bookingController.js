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
// --- API: Create Booking ---
export const createBooking = async (req, res) => {
  try {
    const {
      room,
      checkInDate,
      startTime,
      endTime,
      guests,
      guestName,
      phoneNumber,
      paymentMethod,
      lunchMenus = [],
      optionalServices = [],
    } = req.body;

    const userId = req?.auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Basic validation
    if (!room || !checkInDate || !startTime || !endTime || !guests || !guestName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (startTime >= endTime) return res.status(400).json({ success: false, message: "End time must be after start time" });

    const roomDoc = await Room.findById(room).populate("hotel");
    if (!roomDoc) return res.status(404).json({ success: false, message: "Room not found" });

    const hotelId = roomDoc.hotel?._id;
    if (!hotelId) return res.status(400).json({ success: false, message: "Room is not linked to a hotel" });

    const checkDate = new Date(checkInDate);
    checkDate.setHours(0, 0, 0, 0);

    const isAvailable = await checkAvailability({ room, checkInDate: checkDate, startTime, endTime });
    if (!isAvailable) return res.status(400).json({ success: false, message: "Room not available for this time" });

    // --- Dynamic Total Price Calculation ---
    let totalPrice = roomDoc.pricePerNight || 0;

    // Add lunch menu prices
    if (lunchMenus.length) {
      lunchMenus.forEach(menuName => {
        const menuItem = roomDoc.lunchMenus.find(m => m.menu === menuName);
        if (menuItem) totalPrice += menuItem.price*guests;
      });
    }

    // Add optional service prices
    if (optionalServices.length) {
      optionalServices.forEach(serviceName => {
        const addOn = roomDoc.optionalAddOns.find(a => a.name === serviceName);
        if (addOn) totalPrice += addOn.price;
      });
    }

    // --- Create Booking ---
    const booking = await Booking.create({
      user: userId,
      room,
      checkInDate: checkDate,
      startTime,
      endTime,
      totalPrice,      // store dynamic totalPrice
      guests,
      guestName,
      phoneNumber,
      status: "pending",
      paymentMethod: paymentMethod || "Pay At Hotel",
      isPaid: false,
      lunchMenus,
      optionalServices,
    });

    // Optional: send confirmation email
    // await sendEmail({ to: userEmail, subject: "Booking Confirmed", text: "Your booking is confirmed!" });
     await sendEmail(
      "mathujaparameshwaran@gmail.com", // replace with real admin email
      "New Booking Request",
      `A new booking has been made by ${req.body.userName}. Please review.`,
      `<h2>New Booking Request</h2>
       <p><b>User:</b> ${req.body.userName}</p>
       <p><b>Date:</b> ${req.body.date}</p>
       <p><b>Status:</b> Pending (waiting for approval)</p>`
    );


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
    console.log("User ID from req:", req.user.id);

    // Find user bookings and populate room
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room") // this works since Booking references Room
      .sort({ createdAt: -1 })
      .lean(); // lean() to allow manual modifications

    // Attach hotel details manually since `room.hotel` is just a string
    const bookingsWithHotel = await Promise.all(
      bookings.map(async (booking) => {
        if (booking.room?.hotel) {
          const hotel = await Hotel.findById(booking.room.hotel).lean();
          return {
            ...booking,
            room: {
              ...booking.room,
              hotel: hotel || booking.room.hotel, // fallback to string if not found
            },
          };
        }
        return booking;
      })
    );

    res.json({ success: true, bookings: bookingsWithHotel });
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};




// Fetch all bookings for admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room") // populate room details
      .sort({ createdAt: -1 })
      .lean();

    // Attach hotel details manually
    const bookingsWithHotel = await Promise.all(
      bookings.map(async (booking) => {
        let hotelDetails = null;
        if (booking.room?.hotel) {
          hotelDetails = await Hotel.findById(booking.room.hotel).lean();
        }
        return {
          ...booking,
          room: {
            ...booking.room,
            hotel: hotelDetails || booking.room.hotel,
          },
        };
      })
    );

    res.json({ success: true, bookings: bookingsWithHotel });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// --- API: Update Payment Status ---
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // booking id
    const { isPaid } = req.body;

    // only hotelOwner or admin can update
    if (req.user.role !== "hotelOwner" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.isPaid = isPaid;
    await booking.save();

    return res.json({
      success: true,
      message: `Booking marked as ${isPaid ? "Paid" : "Unpaid"}`,
      booking,
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to update payment status" });
  }
};


// --- API: Update Booking Status (Approve/Reject by Admin/Owner) ---
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;  // booking id
    const { status } = req.body; // "confirmed" or "cancelled"

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // only hotelOwner or admin can approve/reject
    if (req.user.role !== "hotelOwner" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const booking = await Booking.findById(id).populate("room");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    // (Optional) Send email to user
    // await sendEmail({
    //   to: booking.userEmail,
    //   subject: `Booking ${status === "confirmed" ? "Approved" : "Rejected"}`,
    //   text: `Your booking for ${booking.room.roomType} is now ${status}.`
    // });

    return res.json({
      success: true,
      message: `Booking ${status}`,
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
};
