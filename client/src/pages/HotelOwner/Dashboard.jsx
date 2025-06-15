import React, { useState, useEffect } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { user, getToken, toast, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    rooms: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      console.log('Full API response:', data);

      if (data.success && Array.isArray(data.halls)) {
        const allBookings = data.halls.flatMap(hall => hall.bookings);
        const totalBookings = allBookings.length;
        const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        setDashboardData({
          rooms: data.halls,
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
        <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
          <img src={assets.totalBookingIcon} alt="Total Bookings Icon" className='max-sm:hidden h-10' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Bookings</p>
            <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
          </div>
        </div>

        <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
          <img src={assets.totalRevenueIcon} alt="Total Revenue Icon" className='max-sm:hidden h-10' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Revenue</p>
            <p className='text-neutral-400 text-base'>Rs. {dashboardData.totalRevenue}</p>
          </div>
        </div>
      </div>

      <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Your Halls and Bookings</h2>

      {/* Display each Hall with its bookings */}
      {dashboardData.rooms.map((hall, index) => (
        <div key={index} className='mb-8'>
          <h3 className='text-lg font-semibold mb-3'>{hall.hallName} (Location: {hall.hallLocation})</h3>

          {hall.bookings.length > 0 ? (
            <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='py-3 px-4 text-gray-800 font-medium'>Customer Name</th>
                    <th className='py-3 px-4 text-gray-800 font-medium'>Room Type</th>
                    <th className='py-3 px-4 text-gray-800 font-medium'>Check-In</th>
                    <th className='py-3 px-4 text-gray-800 font-medium'>Check-Out</th>
                    <th className='py-3 px-4 text-gray-800 font-medium text-center'>Total Price</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  {hall.bookings.map((booking, idx) => (
                    <tr key={idx}>
                      <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{booking.userName}</td>
                      <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{booking.roomType}</td>
                      <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                      <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                      <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>Rs. {booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='text-gray-500'>No bookings for this hall.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
