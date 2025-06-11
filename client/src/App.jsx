import React from 'react'
import Navbar from './components/Navbar'
import { Route,Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/Footer'
import Allrooms from './pages/Allrooms'
import RoomDetails from './pages/RoomDetails'
import MyBookings from './pages/MyBookings'
import Layout from './pages/HotelOwner/Layout'
import Dashboard from './pages/HotelOwner/Dashboard'
import AddRoom from './pages/HotelOwner/AddRoom'
import ListRoom from './pages/HotelOwner/ListRoom'
import {Toaster} from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import HotelReg from './components/HotelReg'

const App = () => {
  
  const isOwnerPath =useLocation().pathname.includes("owner");
  const  {showHotelReg}= useAppContext();


  return (
    <div>
      <Toaster/>
      {!isOwnerPath && <Navbar/>}
        {showHotelReg && <HotelReg />}

      <div className='min-h-[70vh]'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/halls' element={<Allrooms/>}/>
        <Route path='/halls/:id' element={<RoomDetails />}/>
        <Route path='/my-bookings' element={<MyBookings/>}/>
        <Route path='/owner' element={ <Layout/>}>
            <Route index element={<Dashboard />}/> 
            <Route path="add-hall" element={<AddRoom />}/> 
            <Route path="list-hall" element={<ListRoom/>}/> 
        
        </Route>

      </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App