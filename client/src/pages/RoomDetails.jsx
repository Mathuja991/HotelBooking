import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets'

import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'



const RoomDetails = () => {

    const {id} =useParams()
    const {rooms,getToken , axios}=useAppContext()
    const[room,setRoom] =useState(null)
    const [mainImage,setMainImage] =useState(null)
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [isAvailable,setIsAvailable] = useState(false);
    const navigate=useNavigate()
    const checkAvailability = async () => {
    try {
        if (checkInDate >= checkOutDate) {
            toast.error('Check-In Date should be less than Check-Out Date');
            return;
        }

        const { data } = await axios.post('/api/bookings/check-availability', {
            room: id,
            checkInDate,
            checkOutDate,
            guests // Include guests if your backend expects it
        });

        if (data.success) {
            if (data.isAvailable) {
                setIsAvailable(true);
                toast.success('Room is available');
            } else {
                setIsAvailable(false);
                toast.error('Room is not available');
            }
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};

   const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
        if (!isAvailable) {
            return checkAvailability();
        } else {
            const { data } = await axios.post('/api/bookings/book', {
                room: id,
                checkInDate,
                checkOutDate,
                guests,
                paymentMethod: "Pay At Hotel"
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message);
                navigate('/my-bookings');
                scrollTo(0, 0);
            } else {
                toast.error(data.message);
            }
        }
    } catch (error) {
        toast.error(error.message);
    }
};


    useEffect(()=>{
        const room = rooms.find(room => room._id === id)
              room && setRoom(room)
              room && setMainImage(room.images[0])
    },[rooms])


return room && (
<div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
{/* Room Details */}
<div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
<h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel.name} <span className='font-inter text-sm'>({room.roomType})</span></h1>
 <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
</div>

<div className='flex items-center gap-1 mt-2'>
    <StarRating />
    <p className='ml-2'>200+ reviews</p>
</div>

<div className='flex items-center gap-1 text-gray-500 mt-2'> 
    <img src={assets.locationIcon} alt="location icon" />
    <span>{room.hotel.address}</span>
</div>

<div className='flex flex-col lg:flex-row mt-6 gap-6'>
    <div className='lg:w-1/2 w-full'>
        <img src={mainImage} alt="image" className='w-full rounded-xl shadow-lg object-cover ' />
    </div>
    <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
        {room.images.length >1 && room.images.map((image,index)=>(
            < img onClick={()=>setMainImage(image)}
             key={index} src={image} alt=" image" 
             className={ `w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline-3 outline-orange-500'}`}/>

        )) }
    </div>
</div>

<div className='flex flex-col md:flex-row md:justify-between mt-10'>
    <div className='flex flex-col'>
        <h1 className='text-3xl md:text-4xl font-playfair'>
            Make Every Moment Grand — Book the Perfect Hall in Minutes
        </h1>
        <div  className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
              {room.amenities.map((item,index)=>(
                <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100' key={index}>
                    <img src={facilityIcons} alt={item} className='w-5 h-5' />
                    <p className='text-xs'>{item}</p>
                </div>

              ))}
        </div>
    </div>
    <p className='text-2xl font-medium'> ${room.pricePerNight}/day</p>
</div>

   <form onSubmit= {onSubmitHandler}className =' flex flex-col md:flex-row items-start md:items-center 
   justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'action="">

    <div className='flex flex-col flex-wrap md:flex-row items-start 
    md:items-center gap-4 md:gap-10 text-gray-500'>

     <div className='flex flex-col'>
        <label htmlFor="checkInDate" className='font-medium'>Check-In </label>
        <input onChange={(e)=>setCheckInDate(e.target.value)} min={new Date().toISOString().split('T')[0]}  type="date" id='checkInDate' placeholder='Check-In' 
        className='w-full rounded border border-gray-300 px-3 py- mt-1.5 outline-none' required/>
     </div>
       
       <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
      <div className='flex flex-col'>
        <label htmlFor="checkOutDate" className='font-medium'>Check-Out </label>
        <input  onChange={(e)=>setCheckOutDate(e.target.value)} min={checkInDate} disabled={!checkInDate} type="date" id='checkOutDate' placeholder='Check-Out' 
        className='w-full rounded border border-gray-300 px-3 py- mt-1.5 outline-none' required/>
     </div>
       
       <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
     <div className='flex flex-col'>
    <label htmlFor="guests" className='font-medium'>Guests</label>
    <input 
        type="number" 
        id='guests' 
        placeholder='1' 
        min='1' // optional: to prevent 0 or negative guest numbers
        onChange={(e) => setGuests(e.target.value)} 
        value={guests}
        className='max-w-xs rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none' 
        required
    />
</div>



    </div>

    <button type='submit' className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
        {isAvailable ? "Book Now " : "Check Availability "}
    </button>
   </form>

   <div className='mt-25 space-y-4' >
    {roomCommonData.map((spec ,index)=> (
        <div key={index} className='flex flex-start gap-2'>
          <img src={spec.icon} alt=""  className='w 6.5'/>

             <div>
                <p className='text-base'>{spec.title}</p>
                 <p className='text-gray-500'>{spec.description}</p>
             </div>


               </div>

             
    ))}
   </div>

   <div className='max-w-7xl border-y border-gray-300 my-15 py-10 text-gray-500'>
         <p> Welcome to our spacious and elegant
             hall — the perfect venue for your special events.
              Whether you're planning a wedding, reception, corporate event,
               or private gathering, our hall offers a refined atmosphere that blends comfort
                and sophistication. Guests will be accommodated on the ground floor based on availability,
                 ensuring ease of access and convenience for all. The venue features a beautifully designed interior with
                  modern amenities, ample seating, and a welcoming ambiance. Pricing is based on standard guest capacity;
                   for group bookings, please specify the number of guests to receive an accurate quote. Let us help you
                    create unforgettable memories in a space
             that truly captures the spirit of your celebration. </p>
   </div>

</div>
)
}

export default RoomDetails