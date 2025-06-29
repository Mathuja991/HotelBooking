import React, { useState, useEffect } from 'react';
import Title from '../../components/Title';
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
      const token = await getToken();
      const { data } = await axios.get('/api/bookings/owner', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.rooms)) {
        const totalBookings = data.rooms.reduce(
          (sum, room) => sum + (room.bookings ? room.bookings.length : 0),
          0
        );
        const totalRevenue = data.rooms.reduce(
          (sum, room) =>
            sum +
            (room.bookings
              ? room.bookings.reduce((rSum, b) => rSum + (b.totalPrice || 0), 0)
              : 0),
          0
        );

        setDashboardData({
          rooms: data.rooms.map((room) => ({
            roomType: room.roomType || room.hallName, // handle both
            bookings: room.bookings,
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
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="px-6 py-8">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Manage bookings, users, and hall availability in one place."
      />

      {/* Summary */}
      <div className="flex gap-6 my-6 flex-wrap text-center">
        <div className="bg-blue-100 text-blue-700 p-4 rounded w-40 shadow">
          <p className="text-2xl font-bold">{dashboardData.totalBookings}</p>
          <p className="text-sm">Total Bookings</p>
        </div>
        <div className="bg-green-100 text-green-700 p-4 rounded w-40 shadow">
          <p className="text-2xl font-bold">Rs. {dashboardData.totalRevenue}</p>
          <p className="text-sm">Total Revenue</p>
        </div>
      </div>

      {/* Booking Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Hall</th>
              <th className="py-2 px-4 border">Guest Name</th>
              <th className="py-2 px-4 border">Phone / Email</th>
              <th className="py-2 px-4 border">Check-In</th>
              <th className="py-2 px-4 border">Check-Out</th>
              <th className="py-2 px-4 border">Price</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.rooms.map((room, roomIndex) =>
              room.bookings.map((booking, index) => (
                <tr key={`${roomIndex}-${index}`} className="bg-white">
                  <td className="py-3 px-4 border text-gray-700">
                    {room.roomType}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    {booking.userName || booking.guestName || 'N/A'}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    {booking.userEmail || booking.phoneNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    {new Date(booking.checkInDate).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    {new Date(booking.checkOutDate).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    Rs. {booking.totalPrice}
                  </td>
                  <td className="py-3 px-4 border text-gray-700">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.isPaid ? 'Paid' : 'Not Paid'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
