import React from 'react';
import { useState, useEffect } from 'react';
import {  createPayment} from '../services/api';
import { toast } from 'react-toastify';



export default function PayBookingForm({ booking, onSuccess }) {

  const initialFormData = {

    grandtotal: "",
    amount_paid: "",
    balance_due: "",
    payment_method: "",
    payment_amount: "",
  };

  // amount_paid + balance = fullpayment = paid

  const [form, setForm] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  //const [error, setError] = useState(null);


  // populate form when booking prop changes
  useEffect(() => {
    if (booking) {
      setForm({
        //edit invoices
        grandtotal: booking.grandtotal || 0,
        amount_paid: booking.amount_paid || 0,
        balance_due: booking.balance_due || 0,
        invoice_status: booking.invoice_status || "unpaid",





      })


    }
  }, [booking]);

  //handler onChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(loading) return;
    //setError(null);

    if (!form.payment_amount|| Number(form.payment_amount) <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }
    if(Number(form.payment_amount) > Number(form.balance_due)) {
      toast.error("Payment exceeds balance due");
      return;
    }

    setLoading(true);


    try {
      const paymentData = {
        // create a payment
        booking_id: booking.id,
        amount: Number(form.payment_amount),
        payment_method: form.payment_method || null,
        reference_number: form.reference_number || null,
        payment_date: new Date().toISOString(),
        notes: form.notes || null,
        payment_type: "partialpayment",
        payment_status: "partial"
      };

      await createPayment(paymentData);
      toast.success("Payment recorded");
      onSuccess();
    } catch (err) {
      //setError(err);
      console.error("Error saving payment:", err);
      toast.error(err.response?.data?.message || "Failed to save payment");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 p-2 grid-cols-2">
        <fieldset className="border rounded-xl p-4">
          <legend>Pay Booking</legend>
          <div className="space-y-3 text-left">
            <div>
              <label className="text-left text-sm font-medium mb-1">Total Amount:</label>
              <input
                type="number"
                name="grandtotal"
                value={form.grandtotal}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                disabled: bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                "
                disabled={true}
              />
            </div>

            <div className=''>
              <label className="text-left text-sm font-medium mb-1">Amount Paid: </label>
              <input
                type="number"
                name="amount_paid"
                value={form.amount_paid}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                disabled: bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                "
                disabled={true}

              />
            </div>

            <div>
              <label className="text-left text-sm font-medium mb-1">Balance/Unpaid:</label>
              <input
                name="balance_due"
                value={form.balance_due}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled: bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                "
                disabled={true}
                min="0"
                step="0.01"
                type="number"
                />
            </div>

            <div>
              <label className="text-left text-sm font-medium mb-1">Payment Amount:</label>
              <input
                type="number"
                name="payment_amount"
                value={form.payment_amount}
                placeholder={form.balance_due}
                onChange={handleChange}
                min="0"
                max={form.balance_due}
                step="0.01"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Payment Method */}
            <div className='pt-2'>
              <label className='block text-sm font-medium mb-1'>Payment Method</label>
              <select
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                className="w-full p-2   border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>


        </fieldset>

        <div className="flex justify-end items-end">
          <button
            type="submit"
            disabled={loading}

            className="bg-blue-500 text-white p-2 w-[150px] rounded hover:bg-blue-600 transition-colors">
            {loading ? 'Saving...' : 'Pay'}
          </button>
        </div>
      </form>
    </div>
  )
}
