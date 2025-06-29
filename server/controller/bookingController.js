import OnlineBooking from "../models/OnlineBooking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import sendEmail from '../configs/nodemailer.js';
import ManualBooking from "../models/ManualBooking.js";
 export const checkAvailability = async ({ room, checkInDate, checkOutDate }) => {
  const overlapsOnline = await OnlineBooking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate }
  });

  const overlapsManual = await ManualBooking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate }
  });

  return overlapsOnline.length === 0 && overlapsManual.length === 0;
};

export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, startTime, endTime } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, startTime, endTime, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBooking = async (req, res) => {
  try {
    const {
      room,
      hotel,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      guestName,
      phoneNumber,
    } = req.body;

    if (!guestName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Guest name and phone number are required" });
    }

    const bookingData = {
      room,
      hotel,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      guestName,
      phoneNumber,
      paymentMethod: "Pay At Hotel",
      isPaid: false,
    };

    // add user only if logged in
    if (req.user && req.user._id) {
      bookingData.user = req.user._id;
    }

    const booking = await OnlineBooking.create(bookingData);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "No Hotel found" });
        }

        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room user")
            .sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({ 
            success: true, 
            dashboardData: { totalBookings, totalRevenue, bookings }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};



export const getOwnerRoomsWithBookings = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const hotels = await Hotel.find({ owner: ownerId });
        if (hotels.length === 0) {
            return res.json({ success: true, rooms: [] });
        }

        const hotelIds = hotels.map(hotel => hotel._id.toString());
        const rooms = await Room.find({ hotel: { $in: hotelIds } });
        const bookings = await OnlineBooking.find({ hotel: { $in: hotelIds } })
            .populate('user', 'firstName email')
            .populate('room', 'roomType');

        const roomsWithBookings = rooms.map(room => {
            const roomBookings = bookings
                .filter(booking => booking.room._id.toString() === room._id.toString())
                .map(booking => ({
                    userName: booking.user.firstName,
                    userEmail: booking.user.email,
                    checkInDate: booking.checkInDate,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    totalPrice: booking.totalPrice,
                    guests: booking.guests,
                    status: booking.status,
                    paymentMethod: booking.paymentMethod,
                    isPaid: booking.isPaid
                }));

            return {
                ...room.toObject(),
                bookings: roomBookings
            };
        });

        res.json({ success: true, rooms: roomsWithBookings });

    } catch (error) {
        console.error('Error fetching owner rooms with bookings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


export const getUserBookings = async (req, res) => {
  try {
    const bookings = await OnlineBooking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};
export const createManualBooking = async (req, res) => {
  try {
    const { guestName, phoneNumber, room, hotel, checkInDate, checkOutDate, guests, totalPrice } = req.body;

    const booking = await ManualBooking.create({
      guestName,
      phoneNumber,
      room,
      hotel,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      paymentMethod: "Pay At Hotel",
      // ⚠️ don't include `user`
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
