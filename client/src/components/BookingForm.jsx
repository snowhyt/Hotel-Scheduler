import React, { useState, useEffect } from 'react';
import { updateBooking } from '../services/api';
import moment from 'moment';

export default function BookingForm({ booking, onSuccess }) {
  const [formData, setFormData] = useState({
    name:             '',
    email:            '',
    phone:            '',
    address:          '',
    room_id:          '',
    check_in:         '',
    check_out:        '',
    booking_status:   'pending',
    total_pax:        '',
    // invoice fields
    grandtotal:       '',
    amount_paid:      '',
    balance:          '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Populate form when booking prop changes (edit mode)
  useEffect(() => {
    if (booking) {
      setFormData({
        name:           booking.name           || '',
        email:          booking.email          || '',
        phone:          booking.phone          || '',
        address:        booking.address        || '',
        room_id:        booking.room_id        || '',
        // ✅ Fixed: check_out was using check_in by mistake before
        check_in:       booking.check_in  ? moment(booking.check_in).format('YYYY-MM-DDTHH:mm')  : '',
        check_out:      booking.check_out ? moment(booking.check_out).format('YYYY-MM-DDTHH:mm') : '',
        // ✅ Fixed: was using booking.status (old field), now uses booking_status
        booking_status: booking.booking_status || 'pending',
        total_pax:      booking.total_pax      || '',
        // invoice fields — from joined query in getAllBooking
        grandtotal:     booking.grandtotal     || '',
        amount_paid:    booking.amount_paid    || '',
        balance:        booking.balance        || '',
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        // guest fields
        name:           formData.name,
        email:          formData.email   || null,
        phone:          formData.phone,
        address:        formData.address || null,
        // booking fields
        room_id:        formData.room_id,
        check_in:       moment(formData.check_in).format('YYYY-MM-DD HH:mm:ss'),
        check_out:      moment(formData.check_out).format('YYYY-MM-DD HH:mm:ss'),
        booking_status: formData.booking_status,
        total_pax:      Number(formData.total_pax || 0),
        // invoice fields — aligned with editBooking backend
        grandtotal:     parseFloat(formData.grandtotal  || 0),
        amount_paid:    parseFloat(formData.amount_paid || 0),
        balance:        parseFloat(formData.balance     || 0),
      };

      await updateBooking(booking.id, submitData);
      onSuccess();
    } catch (err) {
      console.error("Error saving booking:", err);
      setError(err.response?.data?.message || "Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ── Booking & Guest Details ── */}
      <fieldset className="border-2 rounded-xl p-5">
        <legend className="px-4 text-xl">Booking & Guest Details</legend>

        <div className="space-y-3">
          <div>
            <label className="block text-left text-sm font-medium mb-1">Guest Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium mb-1">Guest Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-left text-sm font-medium mb-1">Check-in *</label>
              <input
                type="datetime-local"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-left text-sm font-medium mb-1">Check-out *</label>
              <input
                type="datetime-local"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-left text-sm font-medium mb-1">Total Pax</label>
              <input
                type="number"
                name="total_pax"
                value={formData.total_pax}
                onChange={handleChange}
                min="0"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1">
              {/* ✅ Fixed: was using booking.status (undefined), now booking_status */}
              <label className="block text-left text-sm font-medium mb-1">Booking Status</label>
              <select
                name="booking_status"
                value={formData.booking_status}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Other Service Details ── */}
      <fieldset className="border-2 border-gray-300 rounded-xl p-4">
        <legend className="px-4 text-xl">Other Service Details</legend>
        <div className="space-y-3">
          <div className="flex gap-4">  </div>
        </div>
        </fieldset>
















      {/* ── Billing Information ── */}
      <fieldset className="border-2 border-gray-300 rounded-xl p-4">
        <legend className="px-4 text-xl">Billing Information</legend>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-left text-sm font-medium mb-1">Grand Total</label>
            <input
              type="number"
              name="grandtotal"
              value={formData.grandtotal}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-left text-sm font-medium mb-1">Amount Paid</label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            {/* ✅ Fixed: was balance_due, backend uses balance */}
            <label className="block text-left text-sm font-medium mb-1">Balance</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Update Booking'}
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
