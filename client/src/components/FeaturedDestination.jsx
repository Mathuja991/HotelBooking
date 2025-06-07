import React from 'react'
import { roomsDummyData } from '../assets/assets'
import HallCard from './HallCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom' ;


const FeaturedDestination = () => {

    const navigate=useNavigate() ;
  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
      <Title
       title="Featured Halls"
       subTitle="Explore our curated selection of premium halls perfect for weddings, events, and celebrations — offering comfort, elegance, and convenience."
      />

       <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
        {roomsDummyData.slice(0,2).map((room,index)=>(
           <HallCard key={room._id} room={room} index ={index}/> 
        ))}
         </div>

        <button onClick={ ()=>{navigate('/halls') ;scrollTo(0,0)}}
           className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded
           bg-white hover:bg-gray-50 transition-all cursor-pointer'>
            View All Hall
        </button>
        </div>

    )
}

export default FeaturedDestination