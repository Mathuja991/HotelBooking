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
        const { data } = await axios.get('/api/bookings/owner', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Full API response:', data);

        if (data.success && Array.isArray(data.halls)) {
            const totalBookings = data.halls.reduce((sum, hall) => sum + (hall.bookings ? hall.bookings.length : 0), 0);
            const totalRevenue = data.halls.reduce((sum, hall) =>
                sum + (hall.bookings ? hall.bookings.reduce((rSum, b) => rSum + (b.totalPrice || 0), 0) : 0), 0);

            // Rename halls to rooms for your existing UI
            setDashboardData({
                rooms: data.halls.map(hall => ({
                    roomType: hall.hallName, // For display
                    bookings: hall.bookings
                })),
                totalBookings,
                totalRevenue,
            });
        } else {
            toast.error(data.message || 'Dashboard data not available');
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.message);
    }
}



    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <div>
            <Title align='left' font='outfit' title='Dashboard' subTitle='Manage bookings, users, and hall availability in one place.' />

           <tbody className='text-sm'>
    {dashboardData.rooms.map((room, roomIndex) => (
        room.bookings.map((booking, index) => (
            <tr key={`${roomIndex}-${index}`} className="bg-gray-100">
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

            </div>
       
    )
}

export default Dashboard;
