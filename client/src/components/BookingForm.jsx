import React, { useState, useEffect } from 'react';
import { createBooking, updateBookingStatus, getRooms, updateBooking } from '../services/api';
import moment from 'moment';

export default function BookingForm({ booking, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    room_id: '',
    check_in: '',
    check_out: '',
    status: 'pending',
    total_amount: '',
    total_pax: '',
    amount_paid: '',
    balance_due: ''


  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch rooms for dropdown
  useEffect(() => {
    fetchRooms();
  }, []);

  // Populate form when booking prop changes
  useEffect(() => {
    if (booking) {
      setFormData({
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
        room_id: booking.room_id || '',
        check_in: booking.check_in ? moment(booking.check_in).format('YYYY-MM-DDTHH:mm') : '',
        check_out: booking.check_out ? moment(booking.check_in).format('YYYY-MM-DDTHH:mm') : '',
        status: booking.status,
        // total_amount: booking.total_amount || '',
        total_pax: booking.total_pax || '',
        amount_paid: booking.amount_paid || '',
        // balance_due: booking.balance_due || ''
      });
    }
  }, [booking]);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

//submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format dates properly for API
      const submitData = {
        ...formData,
        check_in: moment(formData.check_in).format('YYYY-MM-DD HH:mm:ss'),
        check_out: moment(formData.check_out).format('YYYY-MM-DD HH:mm:ss')
      };

      if (booking && booking.id) {
        // Update existing booking
        await updateBooking(booking.id, submitData);
      } else {
        // Create new booking
        await createBooking(submitData);
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving booking:", err);
      setError(err.response?.data?.message || "Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
<fieldset className='border-2 border-blue-300 rounded-xl p-4'>
  <legend className='px-4 text-xl'>Booking Information</legend>
      

      <div>
        <label className="block text-left text-sm font-medium mb-1">Guest Name </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className='py-4'>
        <label className="block text-left  text-sm font-medium mb-1">Guest Email </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
  

      <div>
        <label className="block text-left  text-sm font-medium mb-1">Phone Number </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
 

    <div className='flex flex-row-3 gap-4 py-4'>
            <div >
        <label className="block text-left  text-sm font-medium mb-1">Check In Date & Time </label>
        <input
          type="datetime-local"
          name="check_in"
          value={formData.check_in}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-left  text-sm font-medium mb-1">Check Out Date & Time </label>
        <input
          type="datetime-local"
          name="check_out"
          value={formData.check_out}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      
      {booking && booking.id && (
        <div>
          <label className="block text-left  text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
  </div>
      <div className='flex flex-row-2 gap-4'>
      <div className='flex-1'>
        <label className="block text-left  text-sm font-medium mb-1">Room </label>
        <select
          name="room_id"
          value={formData.room_id}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >S
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.room_number  } - {room.room_type} (${room.price}/night) - [Total pax: {room.room_capacity}]
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className='block text-left text-sm font-medium mb-1'>Total pax</label>
        <input 
        type="number"
        name="total_pax"
        value={formData.total_pax}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

  </div>

</fieldset>

<fieldset className='border rounded-xl'>
  <legend>Billing Information</legend>
          <div>
        <label className="block text-sm font-medium mb-1">Total Amount</label>
        <input
          type="number"
          name="total_amount"
          value={formData.total_amount}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline focus:ring-2 focus:ring-blue-500"
          />
        </div>





</fieldset>



      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : (booking && booking.id ? 'Update Booking' : 'Create Booking')}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}