import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {ToastContainer} from 'react-toastify';


//pages
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import CreateBooking from './pages/CreateBooking'
import EditBooking from './pages/EditBooking'
import Rooms from './pages/Rooms'
import Availability from './pages/Availability'
import EditRoom from './pages/EditRoom'


//components
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
        <Navbar />

        <div className='min-h-screen ml-64 mr-8'>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/create-booking" element={<CreateBooking />} />
            <Route path="/booking/edit/:id" element={<EditBooking />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/rooms/edit/:id" element={<EditRoom />} />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />
    </BrowserRouter>
  )
}

export default App