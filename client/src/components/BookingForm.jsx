//BookingForm

import React, { useState, useEffect } from 'react';
import { updateBookingStatus, getAllServices, getAvailableRooms } from '../services/api';
import moment from 'moment';
import { toast } from 'react-toastify';

export default function BookingForm({ booking, onSuccess }) {


  const intialFormData = {
    room_id: "",
    room_type: "",
    service_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    room_capacity: "",
    total_pax: "",
    isAddPax: "",
    additionalPax: "",
    isAddService: "", //true
    chargeName: "",
    chargePrice: "",
    breakfast1: "",
    breakfast2: "",
    paymentType: "",
    payment: "",
    discount: 0,
    payment_method: "",
    reference_number: "",
    notes: "",
    invoice_status: "",
  };


  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [form, setForm] = useState(intialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);


  //Derived Calculations
  // ── Derived calculations ──────────────────────────────────────
  const totalServices = selectedServices.reduce((total, service) => {
    return total + (parseFloat(service.price) || 0);
  }, 0);

  const addPaxTotalPrice = (parseFloat(form.additionalPax) || 0) * 300;

  const customCharge = parseFloat(form.chargePrice) || 0;

  const selectedRoom = rooms.find(room => room.id === parseInt(form.room_id));

  const bookingTotal = selectedRoom && checkIn && checkOut
    ? selectedRoom.price * Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    : 0;

  const earlyCheckInFee = 0; // Not applicable in edit mode

  const subTotal = bookingTotal + customCharge + totalServices + addPaxTotalPrice;


 



  // Replace the first useEffect entirely:
  useEffect(() => {
    if (checkIn && checkOut) {
      fetchRooms(checkIn, checkOut);
    }
  }, [checkIn, checkOut]);

  // ✅ Fix fetchRooms to accept dates as parameters
  const fetchRooms = async (ciDate, coDate) => {
    if (!ciDate || !coDate) return;
    try {
      const roomResult = await getAvailableRooms(
        moment(ciDate).format("YYYY-MM-DD HH:mm"),
        moment(coDate).format("YYYY-MM-DD HH:mm")
      );
      setRooms(roomResult.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    try {
      const serviceResult = await getAllServices();
      setServices(serviceResult.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);



  // Populate form when booking prop changes (edit mode)
  useEffect(() => {
    if (booking) {
      if (booking.booking_services && booking.booking_services.length > 0) {
        setSelectedServices(booking.booking_services);
        setForm(prev => ({ ...prev, isAddService: true }));
      }

      const [b1, b2] = (booking.breakfast_package || "").split(",");

     

      setForm({

        // ✅ Fixed: check_out was using check_in by mistake before
        check_in: booking.check_in ? moment(booking.check_in).format('YYYY-MM-DDTHH:mm') : '',
        check_out: booking.check_out ? moment(booking.check_out).format('YYYY-MM-DDTHH:mm') : '',
        // ✅ Fixed: was using booking.status (old field), now uses booking_status


        // booking details
        room_id: booking.room_id || '',
        room_type: booking.room_type || '',
        booking_status: booking.booking_status?.toLowerCase() || 'pending',
        total_pax: booking.total_pax || 0,
        isAddPax: booking.isAddPax || false,
        additionalPax: booking.additional_pax || 0,
        isAddService: (booking.booking_services && booking.booking_services.length > 0) ? "true" : "false",


        //guest details
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
        address: booking.address || '',



        // invoice fields — from joined query in getAllBooking
        chargeName: booking.custom_charge_name || '',
        chargePrice: booking.custom_charge || '',
        breakfast_complementary: booking.breakfast_complementary || '',
        breakfast1: b1?.trim() || '',
        breakfast2: b2?.trim() || '',
        //combine breakfast 1 and 2 stored in invoices
        breakfast_package: booking.breakfast_package || '',

        //
        invoice_status: booking.invoice_status?.toUpperCase() || '',
        paymentType: booking.payment_type || '',
        payment: booking.payment || '',
        discount: booking.discount?.toString() || "0",
        payment_method: booking.payment_method || '',
        grandtotal: booking.grandtotal || '',
        amount_paid: booking.amount_paid || '',
        balance: booking.balance || '',
      });

      if (booking.check_in && booking.check_out) {
        const ci = new Date(booking.check_in);
        const co = new Date(booking.check_out);
        setCheckIn(ci);
        setCheckOut(co);
        fetchRooms(ci, co);   // ← pass directly, don't rely on state
      }
    }
  }, [booking]);


  const addService = () => {
    if (!form.service_id) return;

    const selectedService = services.find(
      service => service.id === parseInt(form.service_id)
    );

    if (!selectedService) return;

    setSelectedServices(prev => [...prev, selectedService]);
    setForm(prev => ({ ...prev, service_id: "" }));

  };




  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "check_in") setCheckIn(value ? new Date(value) : null);
    if (name === "check_out") setCheckOut(value ? new Date(value) : null);
  };
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log(form.booking_status);
    try {

      await updateBookingStatus(booking.id, form.booking_status);
      onSuccess();
    } catch (err) {
      console.error("Error saving booking:", err);
      toast.error(err.response?.data?.message || "Failed to update booking status")
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 grid-cols-2">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className='flex flex-col overflow-hidden'>
        <div className="flex flex-cols-2 gap-6 overflow-y-scroll h-180">
          <div className='flex-1'>
            {/* ── Booking Details ── */}
            <fieldset className="border rounded-xl p-5 mb-2">
              <legend className="px-4 text-md">Booking Information</legend>


              <div className="space-y-3">
                <div className="gap-4">
                  <div className="">
                    <label className="block text-left text-sm font-medium mb-1">Check-in *</label>
                    <input
                      type="datetime-local"
                      name="check_in"
                      value={form.check_in ? moment(form.check_in).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={handleChange}
                      required
                      disabled={true}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="">
                    <label className="block text-left text-sm font-medium mb-1">Check-out *</label>
                    <input
                      type="datetime-local"
                      name="check_out"
                      value={form.check_out ? moment(form.check_out).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={handleChange}
                      required
                      disabled={true}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-left text-sm font-medium mb-1">Total Pax</label>
                    <input
                      type="number"
                      name="total_pax"
                      value={form.total_pax}
                      onChange={handleChange}
                      min="0"
                      disabled={true}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex-1">
                    {/* ✅ Fixed: was using booking.status (undefined), now booking_status */}
                    <label className="block text-left text-sm font-medium mb-1">Booking Status</label>
                    <select
                      name="booking_status"
                      value={form.booking_status}
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

                {/* Room Selection */}
                <label

                  className="block text-left text-sm font-medium mb-1"
                >Room Type</label>
                <select
                  name="room_type"
                  value={form.room_type}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full mb-4 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"

                >
                  <option value="">Select Room Type</option>
                  <option value="Dormitory">Dormitory</option>
                  <option value="Superior Double">Superior Double</option>
                  <option value="Superior Room">Superior Room</option>
                  <option value="Superior Deluxe">Superior Deluxe</option>
                  <option value="Junior Suites">Junior Suites</option>
                  <option value="Family Room">Family Room</option>
                </select>

                <select
                  name={form.room_id}
                  value={form.room_id}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <option value="">Select Room</option>
                  {rooms
                    .filter((room) => {
                      if (!form.room_type) return true;

                      return room.room_type === form.room_type;

                    })

                    .map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={room.isBooked}
                      >
                        {room.room_number} - ₱{room.price}
                        {room.isBooked ? "(Occupied)" : ""}
                      </option>
                    )

                    )
                  }
                </select>




              </div>
            </fieldset>
            {/* 
            <fieldset className="border rounded-xl p-4">
              <legend className="px-4 text-md">Guest Information</legend>
              <div>

              </div>

              <div>
                <label className="block text-left text-sm font-medium mb-1">Guest Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                 disabled={true}
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium mb-1">Guest Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                   disabled={true}
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
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
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={true}
                />
              </div>
            </fieldset> */}

            {/* ── Other Service Details ── */}
            <fieldset className="border rounded-xl p-4">
              <legend className="px-4 text-md">Other Service Details</legend>

              <div>
                {/* custom service */}
                <label className='block text-sm font-medium mb-1'>Custom Additional Charge</label>
                <div className='text-left flex flex-col-2 gap-4'>
                  <input
                    type="text"
                    name='chargeName'
                    value={form.chargeName}
                    onChange={handleChange}
                    placeholder='Name'
                    className='border w-full mb-1 p-2 rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                    disabled={true}
                  />
                  <input
                    type="number"
                    name='chargePrice'
                    value={form.chargePrice}
                    onChange={handleChange}
                    placeholder='Price'
                    min='0'
                    className='border w-full mb-1 p-2 rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                    disabled={true}
                  />
                </div>

                {/* breakfast */}
                <div className='text-left pt-2 '>
                  <p className="block text-sm font-medium mb-1">Complementary Breakfast: </p>
                  <span>{booking.breakfast_complementary ? booking.breakfast_complementary : " -"}</span>

                </div>

                {form.breakfast_complementary === "1-complementary" &&
                  (

                    <div className='text-left'>
                      <label className="block text-sm font-medium mb-1">Breakfast Package Menu</label>
                      <select
                        name="breakfast1"
                        value={form.breakfast1}
                        onChange={handleChange}
                        className="w-full mb-1 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={true}

                      >
                        <option value="" >N/A</option>
                        <option value="Sausage and Egg">Sausage and Egg</option>
                        <option value="Bacon and Ham">Bacon and Ham</option>
                        <option value="Hotdog and Cheese">Hotdog and Cheese</option>


                      </select>
                    </div>

                  )}
                {/* breakfast 1 */}
                {form.breakfast_complementary === "2-complementary" &&
                  (
                    <div className='text-left pt-2'>
                      <label className="block text-sm font-medium mb-1">Breakfast Package 1</label>
                      <select
                        name="breakfast1"
                        value={form.breakfast1}
                        onChange={handleChange}
                        className="w-full mb-1 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={true}
                      >
                        <option value="" >N/A</option>
                        <option value="Sausage and Egg">Sausage and Egg</option>
                        <option value="Bacon and Ham">Bacon and Ham</option>
                        <option value="Hotdog and Cheese">Hotdog and Cheese</option>

                        {/* breakfast 2 */}
                      </select>

                      <div className='text-left pt-2'>
                        <label className="block text-sm font-medium mb-1">Breakfast Package 2</label>
                        <select
                          name="breakfast2"
                          value={form.breakfast2}
                          onChange={handleChange}
                          className="w-full mb-1 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          disabled={true}

                        >
                          <option value="" >N/A</option>
                          <option value="Sausage and Egg">Sausage and Egg</option>
                          <option value="Bacon and Ham">Bacon and Ham</option>
                          <option value="Hotdog and Cheese">Hotdog and Cheese</option>


                        </select>
                      </div>
                    </div>
                  )}

                {/* Additional Pax */}
                <div className='text-sm flex justify-items-start items-center'>
                  <p className='text-left font-medium'>Add Pax: </p>
                  <label className='px-4 py-2 cursor-pointer'>
                    <input
                      type="radio"
                      id='Yes'
                      name='isAddPax'
                      value={true}
                      disabled={true}
                      onChange={handleChange}
                      checked={form.isAddPax === "true"}

                    />
                    <span className='pl-2'>Yes</span>
                  </label>

                  <label className='px-4 py-2 cursor-pointer'>
                    <input
                      type="radio"
                      id='No'
                      name='isAddPax'
                      value={false}
                      disabled={true}
                      onChange={handleChange}
                      checked={!form.isAddPax || form.isAddPax === "false"}

                    />
                    <span className='pl-2'>No</span>
                  </label>
                </div>
                <div>
                  <input
                    type="number"
                    onChange={handleChange}
                    placeholder="Number of additional pax"
                    value={form.additionalPax}
                    name="additionalPax"
                    min="0"
                    disabled={true}
                    className='w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'

                  />
                </div>
                {/* Select a service */}

                <div
                  className='text-sm flex justify-items-start items-center '
                >
                  <p className=' text-left font-medium'>Add Service: </p>
                  <label className='px-4 py-2 cursor-pointer'>
                    <input
                      type="radio"
                      id='Yes'
                      name='isAddService'
                      value={true}
                      onChange={handleChange}
                      disabled={true}
                      checked={form.isAddService === "true"}

                    />
                    <span className='pl-2'>Yes</span>
                  </label>

                  <label className='px-4 py-2 cursor-pointer'>
                    <input
                      type="radio"
                      id='No'
                      name='isAddService'
                      value={false}
                      onChange={handleChange}
                      disabled={true}
                      checked={!form.isAddService || form.isAddService === "false"}

                    />
                    <span className='pl-2'>No</span>
                  </label>


                </div>


                <div className='flex gap-4 items-center text-sm'>

                  <select
                    name="service_id"
                    value={form.service_id}
                    onChange={handleChange}
                    disabled={form.isAddService !== "true"}
                    className={`w-full p-2 border rounded ${form.isAddService !== 'true' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}


                  >
                    <option value="">Select a Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₱{service.price}
                      </option>
                    ))}

                  </select>

                  <button
                    type='button'
                    onClick={addService}
                    disabled={true}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed "
                  >Add</button>

                </div>

                <div>

                  {form.isAddService === "true" && (
                    <div className="">
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Selected Services</h3>

                        <ul className="space-y-2">
                          {selectedServices.map((service, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center border rounded p-2"
                            >
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500">
                                  ₱{service.price}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServices(prev =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                                disabled={true}
                                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  )}


                </div>


              </div>
            </fieldset>


          </div>
          <div className='flex-1 inline-block'>
            <fieldset className="border rounded-xl p-4 mb-2">
              <legend className="px-4 text-md">Invoice Status</legend>

              <h1 className={` text-[120px] text-center pb-2 font-medium  
                ${
                form.invoice_status === "PAID" ? "text-green-500" :
                form.invoice_status === "UNPAID" ? "text-red-500" :
                form.invoice_status === "PARTIAL" ? "text-yellow-500" :
                "text-gray-500"
                }
                `}>--{form.invoice_status}--</h1>
            </fieldset>




            {/* ── Billing Information ── */}
            <fieldset className="border rounded-xl p-4">
              <legend className="px-4 text-md">Billing Information</legend>
              <div className='w-full text-sm'>
                <p className='font-medium pb-1'>Booking Details</p>
                <table className=" w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Room Details</th>
                      <th className=" px-4 py-2 text-left">Rate</th>
                      <th className="px-4 py-2 text-left">Nights</th>
                      <th className=" px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(() => {
                      const selectedRoom = rooms.find(
                        room => room.id === parseInt(form.room_id)
                      );

                      if (!selectedRoom || !checkIn || !checkOut) return null;

                      const nights = Math.ceil(
                        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
                      );
                      const total = selectedRoom.price * nights;



                      return (
                        <tr className='border-t'>
                          <td className='p-2'>
                            {selectedRoom.room_number}
                            <br />
                            <span className='text-gray-500 text-xs'>
                              {selectedRoom.room_type}
                            </span>
                          </td>

                          <td className='p-2'>
                            ₱{selectedRoom.price.toLocaleString()}

                          </td>

                          <td className='p-2'>
                            {nights}
                          </td>

                          <td className='p-2 font-semibold'>
                            ₱{total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
                <div className='px-2'>
                  <p className='font-bold text-sm pt-4 text-left'>Other Service Payments</p>
                  {/* {earlyCheckInFee > 0 && (
                  <div className='flex py-1'>
                    <p>Early Check-in Fee: ({14 - checkIn.getHours()} hr/s before 2PM)</p>
                    <span className='text-right font-medium flex-1'>₱{earlyCheckInFee.toLocaleString()}</span>
                  </div>
                )} */}

                  {earlyCheckInFee > 0 && checkIn && (
                    <div className='flex py-1'>
                      <p>Early Check-in Fee: ({14 - checkIn.getHours()} hr/s before 2PM)</p>
                      <span className='text-right font-medium flex-1'>₱{earlyCheckInFee.toLocaleString()}</span>
                    </div>
                  )}

                  <div className='flex py-1'>
                    <p className='text-left '>Custom Charge: {form.chargeName}</p>
                    <span className='text-right flex-1 font-medium'>₱{form.chargePrice}</span>
                  </div>

                  <div className='flex py-1'>
                    <p>Additional Pax: ({form.additionalPax}pax) </p>
                    <span className='text-right font-medium flex-1'>₱{addPaxTotalPrice}.00</span>
                  </div>


                  <div className='flex py-1'>
                    <p>Additional Services: </p>
                    <span className='text-right font-medium flex-1'>₱{totalServices}.00</span>
                  </div>

                </div>
                <hr />
                <div className="flex justify-between items-center pr-2">
                  <p className="font-medium">Total Amount:</p>
                  <span className=''>₱{subTotal.toLocaleString()}.00</span>
                </div>

                <div className='text-left pt-2'>

                  <div>
                    <label className='block text-sm font-medium mb-1'>Discount</label>
                    <select
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      disabled={true}
                      className='w-full border p-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                    >
                      <option value="0.00">No discount</option>
                      <option value="0.20">Senior Citizen/PWD Discount - 20% off</option>
                      <option value="0.10">Children Discount - 10% off</option>
                      <option value="0.15">2205 Anniversary Promo! - 15% off</option>
                    </select>
                  </div>
                  {/* Payment Method */}
                  <div className='pt-2'>
                    <label className='block text-sm font-medium mb-1'>Payment Method</label>
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleChange}
                      disabled={true}
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



                <div>


                </div>
              </div>

            </fieldset>


          </div>
        </div>








        {/* Actions */}
        <div className="flex gap-3  p-2">
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
      </div>


    </form>
  );
}
