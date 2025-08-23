import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import toast from "react-hot-toast";
import { useAppContext } from '../../context/AppContext';

const BookedDetails = () => {
  const { axios, getToken, user } = useAppContext();
  const [bookings, setBookings] = useState([]);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchRoom, setSearchRoom] = useState("");

  // ✅ Fetch Bookings
  useEffect(() => {
    const fetchOwnerBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/all', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
        if (data.success) setBookings(data.bookings);
        else toast.error(data.message || "Failed to fetch bookings");
      } catch (error) {
        toast.error(error.message || "An error occurred while fetching bookings");
      }
    };

    fetchOwnerBookings();
  }, [user, axios, getToken]);

  // ✅ Filtering logic
  const filteredBookings = bookings.filter((booking) => {
    const guestMatch = booking.guestName?.toLowerCase().includes(searchName.toLowerCase());
    const roomMatch = booking.room?.roomType?.toLowerCase().includes(searchRoom.toLowerCase());
    const dateMatch = searchDate
      ? new Date(booking.checkInDate).toISOString().slice(0, 10) === searchDate
      : true;

    return guestMatch && roomMatch && dateMatch;
  });

  return (
    <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
      <Title title='All Bookings' subTitle='View and manage all hall reservations' align='left' />

      {/* ✅ Filter Section */}
      <div className='flex flex-col md:flex-row gap-4 mt-6 mb-6'>
        <input
          type="text"
          placeholder="Search by Guest Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Search by Room Type"
          value={searchRoom}
          onChange={(e) => setSearchRoom(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
        />
      </div>

      {/* ✅ Bookings Table */}
      <div className='max-w-7xl mt-8 w-full text-gray-800'>
        <div className='hidden md:grid md:grid-cols-[2fr_2fr_2fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
          <div>Guest Name</div>
          <div>Phone Number</div>
          <div>Room Type</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
          <div key={booking._id} className='grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t'>
            
            {/* Guest Name */}
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>{booking.guestName || "Unknown"}</p>
            </div>

            {/* Phone Number */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm text-gray-500'>{booking.phoneNumber || "N/A"}</p>
            </div>

            {/* Room Type */}
            <div className='flex flex-col'>
              <p className='font-playfair text-lg'>{booking.room?.roomType || "Unknown Type"}</p>
            </div>

            {/* Date & Time */}
            <div>
              <p className='text-sm'>{booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "N/A"}</p>
              <p className='text-sm text-gray-500'>{booking.startTime || "N/A"} - {booking.endTime || "N/A"}</p>
            </div>

            {/* Payment Status */}
      {/* Payment Status */}
<div className='flex flex-col items-start justify-center pt-3'>
  <div className='flex items-center gap-2 mb-1'>
    <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
    <p className={`text-sm ${booking.isPaid ? "text-green-500" : "text-red-500"}`}>
      {booking.isPaid ? "Paid" : "Unpaid"}
    </p>
  </div>

  {/* ✅ Toggle switch visible only for hotelOwner */}

    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={booking.isPaid}
        onChange={async () => {
          try {
            const { data } = await axios.put(
              `/api/bookings/${booking._id}/pay`,
              { isPaid: !booking.isPaid },
              { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (data.success) {
              toast.success(`Booking updated: ${!booking.isPaid ? "Paid ✅" : "Unpaid ❌"}`);
              setBookings((prev) =>
                prev.map((b) =>
                  b._id === booking._id ? { ...b, isPaid: !booking.isPaid } : b
                )
              );
            } else {
              toast.error(data.message || "Failed to update payment status");
            }
          } catch (error) {
            toast.error(error.message || "Error while updating payment");
          }
        }}
      />
      {/* Switch style */}
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition"></div>
      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
    </label>
  
</div>


          </div>
        )) : (
          <p className="text-center text-gray-500 mt-6">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default BookedDetails;
