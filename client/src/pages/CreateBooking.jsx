//CreateBooking


import React, { useState, useEffect } from 'react';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { createBooking, getAllServices, getAvailableRooms } from "../services/api.js";
import moment from 'moment';
import { toast } from "react-toastify";


export default function CreateBooking() {

  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [earlyCheckIn, setEarlyCheckIn] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState('No');
  const [customCharges, setCustomCharges] = useState([]);

  const initialForm = {
  room_id:          "",
  room_type:        "",
  service_id:       "",
  name:             "",
  email:            "",
  phone:            "",
  address:          "",
  total_pax:        "",
  isAddPax:         "",
  additionalPax:    "",
  isAddService:     "",
  chargeName:       "",
  chargePrice:      "",
  breakfast1:        "",
  breakfast2:       "",
  paymentType:      "",
  payment:          "",
  discount:         0,
  payment_method:   "",   // ← add
  reference_number: "",   // ← add
  notes:            "",   // ← add
  
};

  const [form, setForm] = useState(initialForm);


const now = new Date();
now.setHours(0, 0, 0, 0);

  const totalServices = selectedServices.reduce((total, service) => {
  return total + (parseFloat(service.price) || 0);
}, 0);



const addPaxTotalPrice =
  form.isAddPax === "true"
    ? (parseFloat(form.additionalPax) || 0) * 300
    : 0;

const customCharge = customCharges.reduce((total, charge) => {
  return total + (parseFloat(charge.price) || 0);
}, 0);

const selectedRoom = rooms.find(
  room => room.id === parseInt(form.room_id)
);




const bookingTotal =
  selectedRoom && checkIn && checkOut
    ? selectedRoom.price *
      Math.ceil(
        (checkOut - checkIn) /
        (1000 * 60 * 60 * 24)
      )
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


const subTotal =
  bookingTotal +
  customCharge +
  totalServices +
  addPaxTotalPrice +
  earlyCheckInFee;

  //discounted booking total amount

  const grandTotal = subTotal - (subTotal * parseFloat(form.discount || 0));
   
  const requiredDeposit = grandTotal * 0.5;
  const requiredPayment = form.paymentType === "fullpayment" ? grandTotal : requiredDeposit;
  const balance = form.paymentType === "fullpayment" ? 0 : requiredPayment - parseFloat(form.payment || 0);


const addCustomCharges = () => {
  if(!form.chargeName || !form.chargePrice) {
    toast.warning("Please provide both a name and price.");
    return;
  }

  const newCharges = {
    name: form.chargeName,
    price: parseFloat(form.chargePrice)
  };

  //Add new charges to array
  setCustomCharges(prev => [...prev, newCharges]);

  setForm(prev => ({
    ...prev,
    chargeName: "",
    chargePrice: ""
  }));

};


  const addService = () => {
    if (!form.service_id) return;

    const selectedService = services.find(
      service => service.id === parseInt(form.service_id)
    );


    if (!selectedService) return;

    setSelectedServices(prev => [...prev, selectedService]);
    setForm({ ...form, service_id: "" });

  }

  const handleEarlyCheckInChange = (e) => {
  setIsEarlyCheckIn(e.target.value);
  if (e.target.value === 'false') {
    setEarlyCheckIn(null);
    setCheckIn(null);
  }
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    const { name, value } = e.target;

    if (name === "isAddService" && value === "false") {
      setSelectedServices([]);

      setForm(prev => ({
        ...prev,
        isAddService: value,

        service_id: ""
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };


    //fetch services ---------------------------------------
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

  }, [])


  //fetch rooms ---------------------------------------
  const fetchRooms = async () => {
    if (!checkIn || !checkOut) return;

    try {
      console.log({
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString()
      });

      const roomResult = await getAvailableRooms(
        moment(checkIn).format("YYYY-MM-DD HH:mm"),
        moment(checkOut).format("YYYY-MM-DD HH:mm")
      );

      setRooms(roomResult.data);

    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    }
  
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      fetchRooms(); //eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [checkIn, checkOut]);





  //fetch deposit ---------------------------------------
  useEffect(() => {
    if(grandTotal > 0)
    {
      setForm(prev =>({ //eslint-disable-line react-hooks/set-state-in-effect
        ...prev,
        payment: 
          prev.paymentType === "fullpayment"
          ? grandTotal.toFixed(2)
          : prev.paymentType === "partialpayment"
          ? requiredDeposit.toFixed(2)
          : ""
      }))

    }
  }, [grandTotal, requiredDeposit, form.paymentType]);



  

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
      custom_charge_name:    customCharges.length < 0 ? customCharges.map(c => c.name).join(", ") : null,
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
};

  



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>


      <form className="bg-white p-6 rounded-xl shadow max-w-325 mx-auto">
        <div className='flex flex-col-2 gap-6 p-6'>
          <fieldset className='border-gray-600 border rounded-2xl p-6 flex-1'>
            <legend className='px-4'>Booking & Guest Details</legend>


            {/* Date and Time */}
            <div className="flex flex-col-3 gap-4 pb-2 text-sm">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in *</label>
                  <input
                    type="date"
                    // value={checkIn ? moment(checkIn).format('YYYY-MM-DDTHH:mm:') : ''}
                   value={checkIn instanceof Date && !isNaN(checkIn) ? moment(checkIn).format('YYYY-MM-DD') : ''}
                    onChange={handleCheckInChange}
                    // min={moment().format('YYYY-MM-DDTHH:mm:ss')}
                    min={moment().format('YYYY-MM-DD')}
                    disabled = {isEarlyCheckIn === 'Yes'}
                    
                    className="w-40 border p-2 rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Check-out *</label>
                <input
                  type="date"
                  // value={checkOut ? moment(checkOut).format('YYYY-MM-DDTHH:mm:') : ''}
                  value={checkOut instanceof Date && !isNaN(checkOut) ? moment(checkOut).format('YYYY-MM-DD') : ''}
                  onChange={handleCheckOutChange}
                  // min={checkIn ? moment(checkIn).format('YYYY-MM-DDTHH:mm:') : moment().format('YYYY-MM-DDTHH:mm:')}
                min={checkIn instanceof Date && !isNaN(checkIn) ? moment(checkIn).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
                    className="w-40 border p-2 rounded "
                  
                />
              </div>
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

            {/* Room Selection */}
            <select
              name="room_type"
              value={form.room_type}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
              
            >
              <option value="">Select Room Type</option>
              <option value="Dome">Dome</option>
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
              className="w-full mb-4 p-2 border rounded"
              
            >
              <option value="">Select Room</option>
              {rooms
                .filter((room) => {
                  if (!form.room_type) return true;

                  return room.room_type === form.room_type;
                })
                .map((room) => (
                  <option key={room.id}
                    value={room.id}
                    disabled={room.isBooked}
                  >
                    {room.room_number} - ₱{room.price}
                    {room.isBooked ? "(Occupied)" : ""}
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
             
            />

            <input
              type="text"
              name='address'
              placeholder='Guest Address (optional)'
              value={form.address}
              onChange={handleChange}
              className='w-full mb-4 p-2 border rounded'
            />

          </fieldset>

          {/* other services details */}
          <fieldset className='border border-gray-600 p-6 rounded-2xl flex-1'>
            <legend className='px-4'>Other Service Details</legend>
            <div className='text-sm'>
              <label className='block text-sm font-medium mb-1'>Custom Additional Charge</label>
              <div className=' text-left flex gap-4'>

                <input
                  type="text"
                  name='chargeName'
                  value={form.chargeName}
                  onChange={handleChange}
                  placeholder='Name'
                  className='border w-full  p-2 rounded'
                />

                <input
                  type="number"
                  name='chargePrice'
                  value={form.chargePrice}
                  onChange={handleChange}
                  placeholder='Price'
                  min='0'
                  className='border w-full  p-2 rounded'
                />

                <button
                  type="button"
                  onClick={addCustomCharges}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
                 </div>
                <div className="">
                  {customCharges.length > 0 && (
                    <div className="mt-4">
                      <ul className="space-y-2">
                        {customCharges.map((charge, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center border rounded p-2"
                          >
                            <div>
                              <p className="font-medium">{charge.name}</p>
                              <p className="text-sm text-gray-500">
                                ₱{charge.price.toFixed(2)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setCustomCharges(prev =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                      </div>
                  )}


                </div>
             

              <div className='text-left pt-2'>
                <p className="block text-sm font-medium mb-1">Complementary Breakfast: </p>
                <span>{selectedRoom ? selectedRoom.breakfast_complementary : " -"}</span>
  
              </div>
          

            {/* #breakfast here */}



             {selectedRoom?.breakfast_complementary === "1-complementary" && 
             (
              
                <div className='text-left'>
                <label className="block text-sm font-medium mb-1">Breakfast Package Menu</label>
                <select
                  name="breakfast1"
                  value={form.breakfast1}
                  onChange={handleChange}
                  className="w-full mb-1 p-2 border rounded"
         
                >
                  <option value="" >N/A</option>
                  <option value="Sausage and Egg">Sausage and Egg</option>
                  <option value="Bacon and Ham">Bacon and Ham</option>
                  <option value="Hotdog and Cheese">Hotdog and Cheese</option>


                </select>
              </div>
              
             )}
            {/* breakfast 1 */}
             {selectedRoom?.breakfast_complementary === "2-complementary" && 
             ( 
                <div className='text-left pt-2'>
                <label className="block text-sm font-medium mb-1">Breakfast Package 1</label>
                <select
                  name="breakfast1"
                  value={form.breakfast1}
                  onChange={handleChange}
                  className="w-full mb-1 p-2 border rounded"
         
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
                  className="w-full mb-1 p-2 border rounded"
         
                >
                  <option value="" >N/A</option>
                  <option value="Sausage and Egg">Sausage and Egg</option>
                  <option value="Bacon and Ham">Bacon and Ham</option>
                  <option value="Hotdog and Cheese">Hotdog and Cheese</option>


                </select>
                </div>
              </div>
              )}

{/*       
              <div className='text-left'>
                <label className="block text-sm font-medium mb-1">Breakfast Package Menu</label>
                <select
                  name="breakfast"
                  value={form.breakfast}
                  onChange={handleChange}
                  className="w-full mb-1 p-2 border rounded"
         
                >
                  <option value="" >N/A</option>
                  <option value="Sausage and Egg">Sausage and Egg</option>
                  <option value="Bacon and Ham">Bacon and Ham</option>
                  <option value="Hotdog and Cheese">Hotdog and Cheese</option>


                </select>
              </div> */}
              <div className='text-sm flex justify-items-start items-center'>
                <p className='text-left font-medium'>Add Pax: </p>
                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    id='Yes'
                    name='isAddPax'
                    value= {true}
                    onChange={handleChange}
                  />  
                  <span className='pl-2'>Yes</span>
                </label>

                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    id='No'
                    name='isAddPax'
                  value= {false}
                    onChange={handleChange}
                    checked={!form.isAddPax}

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
                    className={`w-full p-2 border rounded${form.isAddPax !== "true" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  />
                </div>
              


              <div className='text-sm flex justify-items-start items-center'>
                <p className=' text-left font-medium'>Add Service: </p>
                <label className='px-4 py-2 cursor-pointer'>
                  <input
                    type="radio"
                    id='Yes'
                    name='isAddService'
                    value={true}
                    onChange={handleChange}
                    
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
                    checked={!form.isAddService}

                  />
                  <span className='pl-2'>No</span>
                </label>


              </div>

              {/* Select a service */}
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
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 "
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
                              className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-700"
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


          {/* //payment details */}
          <fieldset className='border border-gray-600 p-6 rounded-2xl flex-1'>
            <legend className='px-4'>Payment Details</legend>

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
                  <p className='text-left '>Custom Charge: {customCharges.length > 0 ? customCharges.map(c => c.name).join(", ") : "None"}</p>
                  <span className='text-right flex-1 font-medium'>₱{customCharge.toLocaleString()}.00</span>
                </div>
                {form.isAddPax === "true" &&
                  (
                    <div className='flex py-1'>
                      <p>Additional Pax: ({form.additionalPax}pax) </p>
                      <span className='text-right font-medium flex-1'>₱{addPaxTotalPrice}.00</span>
                    </div>
                  )}

                  {form.isAddService === "true" &&
                  (
                    <div className='flex py-1'>
                      <p>Additional Services: </p>
                      <span className='text-right font-medium flex-1'>₱{totalServices}.00</span>
                    </div>
                  )}
              </div>
              <hr />
              <div className="flex justify-between items-center mb-4 pr-2" >
                <p className="font-medium">Total Amount:</p>
                <span className='font-bold'>₱{subTotal.toLocaleString()}.00</span>
              </div>






              <div className='text-left pt-2'>

              <div>
                <label className='block text-sm font-medium mb-1'>Discount</label>
                <select 
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className='w-full border p-2'
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
                className="w-full p-2   border rounded"
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

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


 


              <div>


              </div>
            </div>
          </fieldset>
        </div>


       
      </form>
    </div>
  );
}