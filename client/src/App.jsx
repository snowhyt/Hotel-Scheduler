import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        
        {/* Main content - add margin left to match navbar width (w-64 = 256px) */}
        <div style={{ marginLeft: '256px' }} className="p-6">
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
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />
    </BrowserRouter>
  )
}

export default App