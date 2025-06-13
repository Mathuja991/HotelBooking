import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";


const checkAvailability = async ({ checkInDate, checkOutDate, room })=>{
    try {
        const bookings = await Booking.find({
        room,
        checkInDate: {$lte: checkOutDate},
        checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
    console.error(error.message);

    }

 }


    export const checkAvailabilityAPI = async (req, res) =>{
    try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({ checkInDate, checkOutDate,
    room});
    res.json({ success: true, isAvailable })
    } catch (error) {
    res.json({ success: false, message: error.message })

    }
 }


export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        // Check availability before creating booking
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });

        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }

        // Get room data with hotel details
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        // Calculate total nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;

        // Create the booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        });

        // Email options
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Details',
            html: `
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username},</p>
                <p>Thank you for your booking! Here are your details:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                    <li><strong>Check-in Date:</strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Total Price:</strong> ${process.env.CURRENCY || '$'}${booking.totalPrice}</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes, feel free to contact us.</p>
            `
        };

        // Send booking confirmation email
            try {
        await transporter.sendMail(mailOptions);
        console.log("Booking email sent successfully");
        } catch (emailError) {
        console.error("Failed to send booking email:", emailError);
        }


        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};


export const getUserBookings = async (req, res) =>{
    try {
    const user = req.user._id;
    const bookings = await Booking.find({user}).populate("room hotel") .sort
    ({createdAt: -1})
    res.json({success: true, bookings})
    } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });

    }

}





export const getHotelBookings = async (req, res) =>{
    try{
        
        const hotel = await Hotel.findOne({owner: req.auth.userId});
    if(!hotel){
    return res.json({ success: false, message: "No Hotel found" });
    }
    const bookings = await Booking.find({hotel: hotel._id}).populate("room hoteluser").sort({ createdAt: -1 });
    // Total Bookings
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

    res.json({success: true, dashboardData: {totalBookings, totalRevenue,bookings}})

    }catch(error){
       res.json({success:false ,message : "Failed to fetch bookings"})
    }

    }