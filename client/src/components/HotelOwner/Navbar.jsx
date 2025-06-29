import { UserButton } from '@clerk/clerk-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3
     bg-white transition-all duration-300'>
        <Link to='/'>
       
           <p className={'text-3xl font-bold font-serif  '}>
                        KANAPATHY HALL
                    </p>
        </Link>
         <UserButton />
    </div>
  )
}

export default Navbar