import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const Dashboard = () => {
    const { user, getToken, toast, axios } = useAppContext();

    const [dashboardData, setDashboardData] = useState({
        rooms: [],
        totalBookings: 0,
        totalRevenue: 0,
    });
const fetchDashboardData = async () => {
    try {
        const token = await getToken();

        // Fetch owner bookings
        const { data } = await axios.get('/api/bookings/owner', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Full API response:', data);

        if (data.success && Array.isArray(data.bookings)) {
            // Group bookings by room
            const roomsMap = {};

            data.bookings.forEach(booking => {
                const roomId = booking.roomId._id;

                if (!roomsMap[roomId]) {
                    roomsMap[roomId] = {
                        _id: roomId,
                        roomType: booking.roomId.roomType,
                        capacity: booking.roomId.capacity,
                        bookings: []
                    };
                }

                roomsMap[roomId].bookings.push(booking);
            });

            const rooms = Object.values(roomsMap);

            const totalBookings = data.bookings.length;
            const totalRevenue = data.bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            setDashboardData({
                rooms,
                totalBookings,
                totalRevenue
            });
        } else {
            toast.error(data.message || 'Dashboard data not available');
        }

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.message);
    }
};



    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <div>
            <Title align='left' font='outfit' title='Dashboard' subTitle='Manage bookings, users, and hall availability in one place.' />

            <div className='flex gap-4 my-8'>
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8 '>
                    <img src={assets.totalBookingIcon} alt="Total Bookings Icon" className='max-sm:hidden h-10' />
                    <div className='flex flex-col sm:ml-4 font-medium'>
                        <p className='text-blue-500 text-lg'>Total Bookings</p>
                        <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
                    </div>
                </div>

                <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8 '>
                    <img src={assets.totalRevenueIcon} alt="Total Revenue Icon" className='max-sm:hidden h-10' />
                    <div className='flex flex-col sm:ml-4 font-medium'>
                        <p className='text-blue-500 text-lg'>Total Revenue</p>
                        <p className='text-neutral-400 text-base'>Rs. {dashboardData.totalRevenue}</p>
                    </div>
                </div>
            </div>

         <div>

                <h2 className='text-xl text-blue-950/70 font-medium my-5'>All Bookings</h2>
<div className='w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-[600px] overflow-y-scroll'>
    <table className='w-full'>
        <thead className='bg-gray-50'>
            <tr>
                <th className='py-3 px-4 text-gray-800 font-medium'>Hall Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium'>Booked By</th>
                <th className='py-3 px-4 text-gray-800 font-medium'>Check-In</th>
                <th className='py-3 px-4 text-gray-800 font-medium'>Check-Out</th>
                <th className='py-3 px-4 text-gray-800 font-medium'>Total Price</th>
                <th className='py-3 px-4 text-gray-800 font-medium'>Payment</th>
            </tr>
        </thead>
        <tbody className='text-sm'>
            {dashboardData.rooms.map(room => (
                room.bookings.map((booking, index) => (
                    <tr key={index} className="bg-gray-100">
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{room.roomType}</td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{booking.userName} ({booking.userEmail})</td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>Rs. {booking.totalPrice}</td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{booking.isPaid ? 'Paid' : 'Not Paid'}</td>
                    </tr>
                ))
            ))}
        </tbody>
    </table>
</div>

            </div>
        </div>
    )
}

export default Dashboard;
