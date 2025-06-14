import React, { useState, useEffect, useCallback } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { user, getToken, toast, axios } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [hotelId, setHotelId] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user) {
      console.log('User not loaded yet...')
      return
    }

    setLoading(true)
    console.log('Fetching data for user:', user.email)

    try {
      const token = await getToken()
      console.log('Fetched token:', token)

      // ✅ Step 1: Get the hotel linked to this user (owner)
      const hotelResponse = await axios.get(`/api/hotels/myhotel`, {

        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Hotel response:', hotelResponse.data)

      const ownerHotelId = hotelResponse.data?._id
      if (!ownerHotelId) {
        toast.error('No hotel found for this user')
        setLoading(false)
        return
      }

      setHotelId(ownerHotelId)

      // ✅ Step 2: Get all bookings
      const bookingsResponse = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Bookings response:', bookingsResponse.data)

      // ✅ Step 3: Filter bookings to only this hotel
      const filteredBookings = bookingsResponse.data.filter(
        booking => booking.hotel === ownerHotelId
      )

      setBookings(filteredBookings)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user, getToken, axios, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalBookings = bookings.length
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

  if (loading) {
    return <div className="text-center py-8">Loading bookings data...</div>
  }

  return (
    <div>
      <Title
        title="Hotel Bookings Dashboard"
        subTitle={`Viewing bookings for your hotel ${hotelId ? `(ID: ${hotelId.slice(-4)})` : ''}`}
      />

      <div className="flex gap-4 my-8">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <img src={assets.totalBookingIcon} alt="" className="h-10" />
          <div>
            <p className="text-gray-500">Total Bookings</p>
            <p className="text-2xl font-semibold">{totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <img src={assets.totalRevenueIcon} alt="" className="h-10" />
          <div>
            <p className="text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold">Rs.{totalRevenue}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.room?.name || `Room ${booking.room?._id?.slice(-4) || ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.guestName || `Guest ${booking.user?.slice(-4) || ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {' '}
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rs.{booking.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {booking.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {hotelId ? 'No bookings found for your hotel' : 'Could not load hotel information'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
