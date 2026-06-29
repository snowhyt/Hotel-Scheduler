//BookingForm

import React, { useState, useEffect } from 'react';
import { createBooking, updateBookingStatus, getAllServices, getAvailableRooms,  } from '../services/api';
import moment from 'moment';
import { toast } from 'react-toastify';

export default function BookingForm({ booking, isEditMode, onSuccess }) {


  const initialForm = {
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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [earlyCheckIn, setEarlyCheckIn] = useState(null);
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState('No');
  const [isExtend, setIsExtend] = useState('No');

console.log("isEditMode:", isEditMode);
//date now
const now = new Date();
now.setHours(0,0,0,0);

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

const earlyCheckInFee = (() => {
  const dateToCheck = isEarlyCheckIn === 'Yes' ? earlyCheckIn : checkIn;
  if (!dateToCheck) return 0;
  const hours = dateToCheck.getHours();
  if (hours < 14) {
    return (14 - hours) * 500;
  }
  return 0;
})();

//subTotal
  const subTotal = bookingTotal + customCharge + totalServices + addPaxTotalPrice + earlyCheckInFee;

//discounted booking total amount
  const grandTotal = subTotal - (subTotal * parseFloat(form.discount || 0));
  const requiredDeposit = grandTotal * 0.5;
  const requiredPayment = form.paymentType === "fullpayment" ? grandTotal : requiredDeposit;
  const balance = form.paymentType === "fullpayment" ? 0 : requiredPayment - parseFloat(form.payment || 0);


// async function fetchRooms(ciDate, coDate) {
//   if (!ciDate || !coDate) return;
//   try {
//     const roomResult = await getAvailableRooms(
//       moment(ciDate).format("YYYY-MM-DD HH:mm"),
//       moment(coDate).format("YYYY-MM-DD HH:mm")
//     );
//     setRooms(roomResult.data);
//   } catch (error) {
//     console.error("Error fetchning rooms:", error );
//     toast.error("Failed to load rooms");
//   }
// }

// useEffect(() => {
//   if(checkIn && checkOut){
//     fetchRooms(checkIn, checkOut);
//   }
// }, [checkIn, checkOut])

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



  // Replace the first useEffect entirely:
  useEffect(() => {
    if (checkIn && checkOut) {
      fetchRooms(checkIn, checkOut); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [checkIn, checkOut]);


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
    fetchServices(); //eslint-disable-line react-hooks/set-state-in-effect
  }, []);



  // Populate form when booking prop changes (edit mode)
  useEffect(() => {
    if (booking) {
      if (booking.booking_services && booking.booking_services.length > 0) {
        setSelectedServices(booking.booking_services); //eslint-disable-line react-hooks/set-state-in-effect
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



const paxMode = isEditMode ? "Total Pax" : "Additional Pax";
const bookingFieldsetTitle = isEditMode ? "Booking Details" : "Booking & Guest Details";



  const addService = () => {
    if (!form.service_id) return;

    const selectedService = services.find(
      service => service.id === parseInt(form.service_id)
    );

    if (!selectedService) return;

    setSelectedServices(prev => [...prev, selectedService]);
    setForm(prev => ({ ...prev, service_id: "" }));

  };



  const handleEarlyCheckInChange = (e) => {
  setIsEarlyCheckIn(e.target.value);
  if (e.target.value === 'false') {
    setEarlyCheckIn(null);
    setCheckIn(null);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "check_in") setCheckIn(value ? new Date(value) : null);
    if (name === "check_out") setCheckOut(value ? new Date(value) : null);
  };
 
  const handleCheckInChange = (e) => {
  if (!e.target.value) { setCheckIn(null); return; }
  const date = new Date(e.target.value);
  date.setHours(14, 0, 0, 0); // default 2:00 PM
  setCheckIn(date);
};

const handleCheckOutChange = (e) => {
  if (!e.target.value) { setCheckOut(null); return; }
  const date = new Date(e.target.value);
  date.setHours(12, 0, 0, 0); // default 12:00 PM
  setCheckOut(date);
};

const isValidDate = (d) => d instanceof Date && !isNaN(d);

  const handleSubmit = async (action) => {
    action.preventDefault();

    if(!isEditMode){
      //new Booking
      
        // ── Validation ────────────────────────────────────────────────
      // ✅ CORRECT
      if (isEarlyCheckIn === 'Yes') {
        if (!isValidDate(earlyCheckIn)) {
          toast.warning("Please select an early check-in date and time");
          return;
        }
        if (!isValidDate(checkOut)) {
          toast.warning("Please select a check-out date");
          return;
        }
        if (earlyCheckIn < now) {
          toast.warning("Early check-in date cannot be in the past");
          return;
        }
          // ✅ must be before 2PM
        if (earlyCheckIn.getHours() >= 14) {
          toast.warning("Early check-in must be before 2:00 PM");
          return;
        }
        // ✅  must be 12AM or later (no overnight early check-in)
        if (earlyCheckIn.getHours() < 0) {
          toast.warning("Early check-in time is invalid");
          return;
        }
      
      
        if (checkOut <= earlyCheckIn) {
          toast.warning("Check-out must be after early check-in");
          return;
        }
      }
        if(isEarlyCheckIn === 'No'){
            if (!checkIn || !checkOut) {
              toast.warning("Please select check-in and check-out dates");
              return;
            }
      
            if (checkIn < now) {
              toast.warning("Check-in date cannot be in the past");
              return;
            }
      
            if (checkOut <= checkIn) {
              toast.warning("Check-out date must be after check-in date");
              return;
            }
        }
        if (!form.room_type) {
          toast.warning("Please select a room type");
          return;
        }      
        if (!form.room_id) {
          toast.warning("Please select a room");
          return;
        }  
        if (!form.name) {
          toast.warning("Please enter guest name");
          return;
        }      
        if (!form.phone) {
          toast.warning("Please enter phone number");
          return;
        }  
        const paymentValue = parseFloat(form.payment) || 0;
        if (action === "paynow" && paymentValue < requiredDeposit) {
          toast.warning(`Deposit must be at least ₱${requiredDeposit.toFixed(2)}`);
          return;
        }
        if (action === "paynow" && !form.payment_method) {
          toast.warning("Please select a payment method");
          return;
        }
        // ── Confirmation dialog (paynow only) ─────────────────────────
        if (action === "paynow") {
          const confirmed = window.confirm("Are you sure you want to proceed to payment?");
          if (!confirmed) return;
        }
      
        // ── All checks passed — create booking ────────────────────────
        setLoading(true);
      
        try {
          // 1. Prepare base booking and guest data
          const bookingData = {
            room_id: parseInt(form.room_id),
            name: form.name,
            email: form.email || null,
            phone: form.phone,
            address: form.address || null,
            check_in:   moment(checkIn).format("YYYY-MM-DD HH:mm"),
            check_out:  moment(checkOut).format("YYYY-MM-DD HH:mm"),
            total_pax:  Number(selectedRoom.room_capacity || 0) + Number(form.additionalPax || 0),
            booking_status: action === "paylater" ? "pending" : "confirmed",
          };
      
          // 2. Prepare invoice data (Server uses internal ID, so no booking_id needed here)
          const invoiceData = {
            room_charge:           bookingTotal,
            custom_charge_name:    form.chargeName || null,
            custom_charge:         customCharge || 0,
            additional_pax:        Number(form.additionalPax || 0),
            additional_pax_charge: addPaxTotalPrice,
            breakfast_package:     [form.breakfast1, form.breakfast2].filter(Boolean).join(", ") || null,
            early_checkin_fee: earlyCheckInFee,
            subtotal:            subTotal,
            discount:         parseFloat(form.discount || 0),
            grandtotal:          grandTotal,
            amount_paid:           action === "paylater" ? 0 : paymentValue,
            balance:              Number(balance.toFixed(2) ),
            invoice_status:        action === "paylater"
                                     ? "unpaid"
                                     : form.paymentType === "fullpayment" ? "paid" : "partial",
            services_charge: totalServices,
            services: selectedServices.map(s => ({
              name: s.name,
              price: s.price,
            })),
      
      
          };
      
          // 3. Prepare payment data
          let paymentData = null;
      
          if (action === "paynow") {
            paymentData = {
              amount:           paymentValue,
              payment_method:   form.payment_method   || null,
              reference_number: form.reference_number || null,
              payment_date:     new Date().toISOString(),
              notes:            form.notes            || null,
              payment_type:     form.paymentType,
              payment_status:   form.paymentType === "fullpayment" ? "paid" : "partial",
            };
          } else {
            paymentData = {
              amount:           grandTotal,
              payment_method:   null,
              reference_number: null,
              payment_date:     null,
              notes:            form.notes || null,
              payment_type:     null,
              payment_status:   "unpaid",
            };
          }
      
          // 4. Combine and send everything in ONE request
          const fullBookingData = {
            ...bookingData,
            invoice: invoiceData,
            payment: paymentData,
            action: action,
            paymentType: form.paymentType,
            paymentValue: paymentValue,
            grandTotal: grandTotal,
            requiredDeposit: requiredDeposit
          };
          
          console.log("Sending booking data:", fullBookingData); // Helpful for debugging
      
          await createBooking(fullBookingData); // Send combined data to the server
        
      
          toast.success("Booking created successfully!");
      
          // ── Reset form ───────────────────────────────────────────────
          setForm(initialForm);
          setCheckIn(null);
          setCheckOut(null);
          setSelectedServices([]);
      
        } catch (error) {
          console.error("Error creating booking:", error);
            const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.error    ||
              "Error creating booking";
              toast.error(errorMessage);
      
        } finally {
          setLoading(false);
        }


    }
    else {

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
              <legend className="px-4 text-md">{bookingFieldsetTitle}</legend>


              <div className="space-y-3">
                <div className="gap-4">
                  <div className="">
                    <label className="block text-left text-sm font-medium mb-1">Check-in *</label>
                    <input
                      type="datetime-local"
                      name="check_in"
                      value={form.check_in ? moment(form.check_in).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={handleCheckInChange}
                      required
                      disabled={isEditMode}
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
                      onChange={handleCheckOutChange}
                      required
                      disabled={isEditMode}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>
          
                       {/* Early Check In */}
              <div className='text-sm flex justify-items-start items-center'>
                <p className=' text-left font-medium'>Early Check In? </p>
                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    name='isEarlyCheckIn'
                    value='Yes'
                    onChange={handleEarlyCheckInChange}
                    checked={isEarlyCheckIn === "Yes"}
                    
                  
                  />
                  <span className='pl-2'>Yes</span>
                </label>

                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    name='isEarlyCheckIn'
                    value='No'
                    onChange={handleEarlyCheckInChange}
                    checked={isEarlyCheckIn === "No"}
                    
                  />
                  <span className='pl-2'>No</span>
                </label>


              </div>
                        <div className='text-right'>
                          <div className='flex justify-end items-center'>
                            <span className='text-xs italic'>(₱500.00 per hour before 2PM)</span>
                          </div>
                              <input 
                            name='earlyCheckIn'
                           value={earlyCheckIn instanceof Date && !isNaN(earlyCheckIn) ? moment(earlyCheckIn).format('YYYY-MM-DDTHH:mm') : ''}
                            onChange={(e => {
                              if(!e.target.value) {setEarlyCheckIn(null); return;}
                              const date = new Date(e.target.value);
                              setEarlyCheckIn(date);
                              setCheckIn(date);
                            })}
                            type="datetime-local"
                            disabled={isEarlyCheckIn === "No"}
                            min={moment().format('YYYY-MM-DDTHH:mm')}
                            className='mb-4 w-full p-2 border rounded disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed '
                            
                            />  
                        </div>

                </div>
                {isEditMode && (
 <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-left text-sm font-medium mb-1">{paxMode}</label>
                    <input
                      type="number"
                      name="total_pax"
                      value={isEditMode ? form.total_pax :form.additionalPax }
                      onChange={handleChange}
                      min="0"
                      disabled={isEditMode}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  

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

              <div className='text-sm flex justify-items-start items-center'>
                <p className=' text-left font-medium'>Extend? </p>
                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    name='isExtend'
                    value='Yes'
                    //onChange={handleEarlyCheckInChange}
                    checked={isExtend === "Yes"}
                    
                  
                  />
                  <span className='pl-2'>Yes</span>
                </label>

                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    name='isEarlyCheckIn'
                    value='No'
                    onChange={handleEarlyCheckInChange}
                    checked={isEarlyCheckIn === "No"}
                    
                  />
                  <span className='pl-2'>No</span>
                </label>

              </div>
              </div>
              </div>

                  )}
               
                {/* Room Selection */}
                <label

                  className="block text-left text-sm font-medium mb-1"
                >Room Type</label>
                <select
                  name="room_type"
                  value={form.room_type}
                  onChange={handleChange}
                  disabled={isEditMode}
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
                  name="room_id"
                  value={form.room_id}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  disabled={isEditMode}
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
                  {/* Guest Info */}

          <input
              type="text"
              name="name"
              placeholder="Guest Name *"
              value={form.name}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled = {isEditMode}
              
            />
                        <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled = {isEditMode}
             
            />
  {   
        !isEditMode && (
          <div>
            <input
              type="email"
              name="email"
              placeholder="Guest Email (optional)"
              value={form.email}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />
            
           



            <input
              type="text"
              name='address'
              placeholder='Guest Address (optional)'
              value={form.address}
              onChange={handleChange}
              className='w-full mb-4 p-2 border rounded'
            />
           </div>
            )}





            </fieldset>

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
                    disabled={isEditMode}
                  />
                  <input
                    type="number"
                    name='chargePrice'
                    value={form.chargePrice}
                    onChange={handleChange}
                    placeholder='Price'
                    min='0'
                    className='border w-full mb-1 p-2 rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                    disabled={isEditMode}
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
                        disabled={isEditMode}

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
                        disabled={isEditMode}
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
                          disabled={isEditMode}

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
                      disabled={isEditMode}
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
                      disabled={isEditMode}
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
                    disabled={form.isAddPax !== "true"}
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
                      disabled={isEditMode}
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
                      disabled={isEditMode}
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
                    disabled={isEditMode}
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
                                disabled={isEditMode}
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
            {(() => {
              if (!isEditMode) return null;
              
              
              return (
                  <div>
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
                  </div>
                )
            })()}





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
                      disabled={isEditMode}
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
                      disabled={isEditMode}
                      className="w-full p-2   border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {!isEditMode && (
                    <div>
                        <div className='text-sm flex justify-items-start items-center'>
                <p className='text-left font-medium'>Payment Type: </p>
                <label className='p-4 cursor-pointer'>
                  <input
                    type="radio"
                    id='fullpayment'
                    name='paymentType'
                    value='fullpayment'
                    onChange={handleChange}
                  />
                  <span className='pl-2'>Full</span>
                </label>

                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    id='partialpayment'
                    name='paymentType'
                    value='partialpayment'
                    onChange={handleChange}


                  />
                  <span className='pl-2'>Partial</span>
                </label>


              </div>

                <div className='pb-14'>
        
                <input
                  type="number"
                  name='payment'
                  placeholder='Deposit Must Be 50% of Total Price'
                  value={form.payment}
                  onChange={handleChange}
                  min={(grandTotal * 0.5).toFixed(2)}
                  max={grandTotal.toFixed(2)}
                  step="0.01"
                  className='w-full p-2 border rounded text-sm'
                />
                </div>
                
        <div className="flex justify-between items-center text-center flex-col gap-4 ">
        {/* PROCEED TO PAY */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit("paynow")}
          className="w-full bg-blue-700 text-white p-2 rounded-lg font-bold hover:bg-blue-400 transition disabled:bg-gray-400 "
        >
          {loading ? "Creating Booking..." : "Proceed to Payment"}
        </button>
        
      
          {/* PAYLATER BUTTON */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit("paylater")}
          className="w-full  bg-slate-700 text-white p-2 rounded-lg font-bold hover:bg-slate-400 transition disabled:bg-gray-400 "
        >
          Pay Later
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => setForm(initialForm)}
          className=" w-full border p-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition disabled:bg-gray-400"
        >
          Clear
        </button>
              </div>
        </div>
                    
                  )}



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
