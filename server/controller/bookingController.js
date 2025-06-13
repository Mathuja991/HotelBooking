import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import sendEmail from '../configs/nodemailer.js';

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });
        return bookings.length === 0;
    } catch (error) {
        console.error("Error checking availability:", error.message);
        throw error;
    }
};

export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const createBooking = async (req, res) => {
  try {
    // your existing booking creation code...

    // Email options:
    const mailOptions = {
      to: req.user.email,
      subject: "Hotel Booking Details",
      html: `
        <h2>Your Booking Details</h2>
        <p>Dear ${req.user.username},</p>
        <ul>
          <li><b>Booking ID:</b> ${booking._id}</li>
          <li><b>Hotel Name:</b> ${roomData.hotel.name}</li>
          <li><b>Location:</b> ${roomData.hotel.address}</li>
          <li><b>Check-in Date:</b> ${booking.checkInDate.toDateString()}</li>
          <li><b>Total Price:</b> ${process.env.CURRENCY || '$'}${booking.totalPrice}</li>
        </ul>
      `,
    };

   console.log("📧 Email to be sent to:", req.user.email);

try {
  await sendEmail({
    to: req.user.email,
    subject: 'Hotel Booking Details',
    text: 'Your booking is confirmed.'
  });
  console.log("✅ Booking email sent successfully");
} catch (emailError) {
  console.error("❌ Failed to send booking email:", emailError);
}



    res.json({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to create booking" });
  }
};

export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("room hotel")
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
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

export const testEmail = async (req, res) => {
    try {
        const result = await sendEmail({
            to: req.user.email,
            subject: 'Test Email from Booking System',
            text: 'This is a test email to verify email functionality is working.'
        });

        if (result.success) {
            res.json({ success: true, message: "Test email sent successfully" });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Failed to send test email", 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error in test email route", 
            error: error.message 
        });
    }
};