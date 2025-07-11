import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa'; 

export const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, user } = useAppContext();

  // Fetch Rooms of the Hotel Owner
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ You had this useEffect inside your toggle function. It MUST be outside.
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const toggleAvailability = async (roomId) => {
    try {
       setRooms(prevRooms =>
       prevRooms.map(room =>
       room._id === roomId ? { ...room, isAvailable: !room.isAvailable } : room
       )
    );
      const { data } = await axios.post('/api/rooms/toggle-availability',
        { roomId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchRooms(); // Refresh list after toggling
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);

      setRooms(prevRooms =>
      prevRooms.map(room =>
        room._id === roomId ? { ...room, isAvailable: !room.isAvailable } : room
      )
    );
    }
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        toast.success(data.message);
        setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Title
        align="left"
        font="outfit"
        title="Hall Listing"
        subTitle="Manage hall listings, bookings, and user activities from one place."
      />

      <p className="text-gray-800 mt-10 font-medium text-lg">All Halls</p>

      <div className="w-full overflow-x-auto mt-4 border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-800 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold max-sm:hidden">Facility</th>
              <th className="px-6 py-4 font-semibold">Price / day</th>
              <th className="px-6 py-4 font-semibold text-center">Availability</th>
              <th className="px-6 py-4 font-semibold text-center">Delete</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4">{item.roomType}</td>
                <td className="px-6 py-4 max-sm:hidden">{item.amenities.join(', ')}</td>
                <td className="px-6 py-4">Rs. {item.pricePerNight}</td>
                <td className="px-6 py-4 text-center">
                  <label className="inline-flex items-center cursor-pointer relative">
                    <input
                      onChange={() => toggleAvailability(item._id)}
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-200"></div>
                    <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
                  </label>
                </td>

                  <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteRoom(item._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Room"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
