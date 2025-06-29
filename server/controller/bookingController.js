import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import sendEmail from '../configs/nodemailer.js';

const checkAvailability = async ({ checkInDate, startTime, endTime, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });
        return bookings.length === 0;
    } catch (error) {
        console.error("Error checking availability:", error.message);
        throw error;
    }
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
            room: roomId,
            checkInDate,
            startTime,
            endTime,
            guests,
            paymentMethod,
        } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const hotel = await Hotel.findById(room.hotel);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        const totalPrice = room.pricePerNight; // Flat rate for 1-day booking

        const booking = await Booking.create({
            user: req.user._id,
            room: roomId,
            hotel: hotel._id,
            checkInDate,
            startTime,
            endTime,
            totalPrice,
            guests,
            paymentMethod
        });

        const emailContent = `
Dear ${req.user.username},

Your booking has been successfully confirmed.

Booking Details:
- Room Type: ${room.roomType}
- Hotel: ${hotel.name}
- Date: ${new Date(checkInDate).toDateString()}
- Time: ${startTime} to ${endTime}
- Guests: ${guests}
- Total Price: $${totalPrice}

Thank you for choosing Kanapathi Hall!

Regards,
Kanapathi Hall Team
`;

        try {
            await sendEmail({
                to: req.user.email,
                subject: 'Kanapathi Hall Booking Confirmation',
                text: emailContent
            });
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

export const getOwnerRoomsWithBookings = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const hotels = await Hotel.find({ owner: ownerId });
        if (hotels.length === 0) {
            return res.json({ success: true, rooms: [] });
        }

        const hotelIds = hotels.map(hotel => hotel._id.toString());
        const rooms = await Room.find({ hotel: { $in: hotelIds } });
        const bookings = await Booking.find({ hotel: { $in: hotelIds } })
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
