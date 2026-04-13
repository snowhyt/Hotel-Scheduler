import React, { useState, useEffect } from 'react';
import { createBooking, updateBookingStatus, getRooms } from '../services/api';
import moment from 'moment';

export default function BookingForm({ booking, onSuccess }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phonenumber: '',
    room_id: '',
    check_in: '',
    check_out: '',
    status: 'pending'
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
        guest_name: booking.guest_name || '',
        guest_email: booking.guest_email || '',
        guest_phonenumber: booking.guest_phonenumber || '',
        room_id: booking.room_id || '',
        check_in: booking.check_in ? moment(booking.check_in).format('YYYY-MM-DDTHH:mm') : '',
        check_out: booking.check_out ? moment(booking.check_out).format('YYYY-MM-DDTHH:mm') : '',
        status: booking.status || 'pending'
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
        await updateBookingStatus(booking.id, submitData.status);
        // Note: You might need an edit endpoint to update all fields
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

            <div>
        <label className="block text-sm font-medium mb-1">Check In Date & Time </label>
        <input
          type="datetime-local"
          name="check_in"
          value={formData.check_in}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Check Out Date & Time </label>
        <input
          type="datetime-local"
          name="check_out"
          value={formData.check_out}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Guest Name </label>
        <input
          type="text"
          name="guest_name"
          value={formData.guest_name}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Guest Email </label>
        <input
          type="email"
          name="guest_email"
          value={formData.guest_email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone Number </label>
        <input
          type="tel"
          name="guest_phonenumber"
          value={formData.guest_phonenumber}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Room </label>
        <select
          name="room_id"
          value={formData.room_id}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.room_number} - {room.room_type} (${room.price}/night)
            </option>
          ))}
        </select>
      </div>



      {booking && booking.id && (
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : (booking && booking.id ? 'Update Booking' : 'Create Booking')}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}