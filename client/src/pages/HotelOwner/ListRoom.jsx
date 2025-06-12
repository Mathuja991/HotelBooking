import React, { useEffect, useState } from 'react';
//import { roomsDummyData } from '../../assets/assets';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';

 const ListRoom = () => {


const [rooms, setRooms] = useState([])
const {axios, getToken, user} = useAppContext()

// Fetch Rooms of the Hotel Owner
const fetchRooms = async ()=>{
    try {

      const { data } = await axios.get('/api/rooms/owner', {headers:
        {Authorization : `Bearer ${await getToken()}`}
      })
   
    if (data.success){
        setRooms(data.rooms)
    
    }else{
      toast.error(data.message)
    }

    }catch(error){
       toast.error(error.message)
    }
    
  }
    const toggleAyailability = async (roomId)=>{
      const {data} = await axios.post('/api/rooms/toggle-availability', {roomId},
      {headers: {Authorization: `Bearer ${await getToken()} `}})
      if (data.success) {
         toast.success(data.message)
         fetchRooms()
      }else{
         toast.error(data.message)
      }


      useEffect(()=>{
          if(user){
          fetchRooms()
          }
          }, [user])

          
        }

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
                      onChange={()=> toggleAyailability(item._id)}
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-200"></div>
                    <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
                  </label>
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
