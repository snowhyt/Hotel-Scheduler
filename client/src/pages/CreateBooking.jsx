import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createBooking, getRooms } from "../services/api.js";

export default function CreateBooking() {
  const [form, setForm] = useState({
    room_id: "",
    name: "",
    email: "",
    phone: "",
    total_pax: "",
    amount_paid: ""
  });

  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms: ", err);
      alert("Failed to load rooms");
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.room_id) {
      alert("Please select a room");
      return;
    }

    if (!form.name) {
      alert("Please enter guest name");
      return;
    }

    if (!form.phone) {
      alert("Please enter phone number");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const now = new Date();
    if (checkIn < now) {
      alert("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date");
      return;
    }

    // Calculate total price (optional - can be done on backend)
    const selectedRoom = rooms.find(room => room.id === parseInt(form.room_id));
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

    setLoading(true);

    try {
      const bookingData = {
        room_id: parseInt(form.room_id),
        name: form.name,
        email: form.email || null,
        phone: form.phone,
        total_pax: parseInt(form.total_pax) || 1,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        amount_paid: parseFloat(form.amount_paid) || 0
      };

      console.log("Sending booking data:", bookingData); // Debug log

      const response = await createBooking(bookingData);
      
      alert("Booking created successfully!");
      console.log("Booking response:", response.data);

      // Reset form
      setForm({
        room_id: "",
        name: "",
        email: "",
        phone: "",
        total_pax: "",
        amount_paid: ""
      });
      setCheckIn(null);
      setCheckOut(null);

    } catch (err) {
      console.error("Error creating booking:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error creating booking";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto">
        {/* Room Selection */}
        <select
          name="room_id"
          value={form.room_id}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.room_number} ({room.room_type}) - ₱{room.price}/night
            </option>
          ))}
        </select>

        {/* Guest Info */}
        <input
          type="text"
          name="name"
          placeholder="Guest Name *"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Guest Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          value={form.phone}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        {/* Date and Time */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in *</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Check-out *</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={checkIn || new Date()}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className='block'>
            <label className='block text-sm font-medium mb-1'>Status</label>
              <select name="status" value={form.status} id=""
              className='w-full border p-2 rounded'>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmedt</option>
               
              </select>
            
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Pax</label>
            <input 
              type="number"
              name="total_pax"
              placeholder="Number of guests"
              value={form.total_pax}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount Paid / Deposit</label>
            <input 
              type="number"
              name="amount_paid"
              placeholder="0.00"
              value={form.amount_paid}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Display calculated total (optional preview) */}
        {checkIn && checkOut && form.room_id && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Booking Summary:</p>
            {(() => {
              const selectedRoom = rooms.find(room => room.id === parseInt(form.room_id));
              const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
              const total = selectedRoom ? selectedRoom.price * nights : 0;
              return (
                <>
                  <p className="font-semibold">Nights: {nights}</p>
                  <p className="font-semibold">Total Price: ₱{total.toLocaleString()}</p>
                </>
              );
            })()}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}