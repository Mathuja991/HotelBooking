import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const BookedDetails = () => {
  const { axios, getToken, user } = useAppContext()
  const [bookings, setBookings] = useState([])

  // Fetch all bookings (admin only)
  const fetchAllBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {  // optional role check
      fetchAllBookings()
    }
  }, [user])

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="All Booked Halls"
        subTitle="View and manage all hall reservations"
        align="left"
      />

      <div className="max-w-7xl mt-8 w-full text-gray-800">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[2fr_2fr_2fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>Customer</div>
          <div>Hall</div>
          <div>Date & Time</div>
          <div>Guests</div>
          <div>Payment</div>
        </div>

        {/* Table Rows */}
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
          >
            {/* Customer Info */}
            <div className="flex flex-col gap-1">
              <p className="font-medium">{booking.user?.name}</p>
              <p className="text-sm text-gray-500">{booking.user?.email}</p>
            </div>

            {/* Hall Info */}
            <div className="flex flex-col">
              <p className="font-playfair text-lg">{booking.hotel.name}</p>
              <span className="text-sm text-gray-500">
                {booking.room.roomType}
              </span>
              <span className="text-sm text-gray-500">
                {booking.hotel.address}
              </span>
            </div>

            {/* Date & Time */}
            <div>
              <p className="text-sm">
                {new Date(booking.checkInDate).toDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>

            {/* Guests */}
            <div className="flex items-center">{booking.guests}</div>

            {/* Payment Status */}
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    booking.isPaid ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`text-sm ${
                    booking.isPaid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {booking.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* No Bookings */}
        {bookings.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No hall bookings found.
          </p>
        )}
      </div>
    </div>
  )
}

export default BookedDetails
