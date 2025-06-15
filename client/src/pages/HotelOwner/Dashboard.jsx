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
            const { data } = await axios.get('/api/rooms/owner', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            console.log('Full API response:', data);

            if (data.success && Array.isArray(data.rooms)) {
                const totalBookings = data.rooms.reduce((sum, room) => sum + (room.bookings ? room.bookings.length : 0), 0);
                const totalRevenue = data.rooms.reduce((sum, room) => sum + (room.bookings ? room.bookings.reduce((rSum, b) => rSum + (b.totalPrice || 0), 0) : 0), 0);

                setDashboardData({
                    rooms: data.rooms,
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

            <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Your Halls and Bookings</h2>
            <div className='w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-[600px] overflow-y-scroll'>
                <table className='w-full'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='py-3 px-4 text-gray-800 font-medium'> Hall Name </th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'> Capacity </th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'> Bookings </th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {dashboardData.rooms.map((room, index) => (
                            <React.Fragment key={index}>
                                <tr className="bg-gray-100">
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                                        {room.roomType}
                                    </td>
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>
                                        {room.capacity}
                                    </td>
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>
                                        {room.bookings && room.bookings.length > 0 ? (
                                            room.bookings.length + ' Bookings'
                                        ) : (
                                            'No Bookings'
                                        )}
                                    </td>
                                </tr>

                                {room.bookings && room.bookings.length > 0 && room.bookings.map((booking, i) => (
                                    <tr key={i}>
                                        <td className='py-2 px-4 text-gray-500 border-t border-gray-300 pl-8'>
                                            <strong>Booked by:</strong> {booking.userName} ({booking.userEmail})
                                        </td>
                                        <td className='py-2 px-4 text-gray-500 border-t border-gray-300 text-center'>
                                            <div><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</div>
                                            <div><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className='py-2 px-4 text-gray-500 border-t border-gray-300 text-center'>
                                            <div><strong>Total Price:</strong> Rs. {booking.totalPrice}</div>
                                            <div><strong>Guests:</strong> {booking.guests}</div>
                                            <div><strong>Payment:</strong> {booking.isPaid ? 'Paid' : 'Not Paid'} ({booking.paymentMethod})</div>
                                            <div><strong>Status:</strong> {booking.status}</div>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Dashboard;
