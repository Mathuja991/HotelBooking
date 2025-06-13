import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const HallCard = ({ room, index }) => {
    return (
        <Link
            className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)]'
            to={'/halls/' + room._id}
            onClick={() => scrollTo(0, 0)}
            key={room._id}
        >
            <img src={room.images[0]} alt={room.roomType} />

            <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full'>Best choice</p>

            <div className='p-4 pt-5'>
                <div className='flex items-center justify-between'>
                    <p className='font-playfair text-3xl font-semibold text-gray-800'>{room.roomType}</p>
                    <div className='flex items-center gap-1'>
                        <img src={assets.starIconFilled} alt="star-icon" /> 4.7
                    </div>
                </div>

                {/* ✅ Capacity Section */}
                <div className='flex items-center gap-2 mt-4'>
                    <img src={assets.capacityIcon} alt="capacity-icon" className='w-5 h-5' />
                    <p className='text-gray-700 text-sm'>{room.capacity} Guests</p>
                </div>

                <div className='flex items-center justify-between mt-4'>
                    <p><span className='text-xl text-gray-800'>${room.pricePerNight}</span> / day</p>
                    <button className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'>Book now</button>
                </div>
            </div>
        </Link>
    )
}

export default HallCard
