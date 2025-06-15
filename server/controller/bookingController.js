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
        // Assume you save booking here and get booking details
        const booking = await Booking.create({ ...req.body, user: req.user._id });

        // Prepare email content
        const emailContent = `
Dear ${req.user.username},

Your booking has been successfully confirmed.

Booking Details:
- Room Type: ${booking.roomType}
- Capacity: ${booking.capacity} people
- Price Per Night: $${booking.pricePerNight}

Thank you for choosing Kanapathi Hall!

Regards,
Kanapathi Hall Team
`;

        // Send email
        try {
            await sendEmail({
                to: req.user.email,
                subject: 'Kanapathi Hall Booking Confirmation',
                text: emailContent
            });
            console.log("Booking email sent successfully");
        } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
        }

        res.status(201).json({ success: true, booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Booking failed' });
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

// Controller: bookingController.js



export const getOwnerRoomsWithBookings = async (req, res) => {
    try {
        const ownerId = req.user.id; // The logged-in hotel owner ID

        // ✅ 1. Find all hotels owned by this owner
        const hotels = await Hotel.find({ owner: ownerId });
        if (hotels.length === 0) {
            return res.json({ success: true, rooms: [] });
        }

        const hotelIds = hotels.map(hotel => hotel._id.toString()); // ✅ use strings

        // ✅ 2. Find all rooms that belong to these hotels
        const rooms = await Room.find({ hotel: { $in: hotelIds } });

        const roomIds = rooms.map(room => room._id.toString());

        // ✅ 3. Find all bookings for these hotels
        const bookings = await Booking.find({ hotel: { $in: hotelIds } })
            .populate('user', 'firstName email')
            .populate('room', 'roomType');

        // ✅ 4. Map bookings to each room
        const roomsWithBookings = rooms.map(room => {
            const roomBookings = bookings
                .filter(booking => booking.room._id.toString() === room._id.toString())
                .map(booking => ({
                    userName: booking.user.firstName,
                    userEmail: booking.user.email,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
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
