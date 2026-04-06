import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API, { createBooking, getRooms } from "../services/api.js";

export default function CreateBooking() {
  const [form, setForm] = useState(
    {
      room_id: "",
      guest_name: "",
      guest_email: "",
      guest_phonenumber: ""
    });


  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {

    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms: ", err);
    }
  };

  //Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (checkIn < now) {
      alert("Check-in date cannot be in the past");
      return;
    }

    if (checkOut < checkIn) {
      alert("Check-out date cannot be before check-in date");
      return;
    }

    try {
      await createBooking({
        ...form,
        check_in: checkIn?.toISOString(),
        check_out: checkOut?.toISOString(),
      });

      alert("Booking created successfully");

      //reset form
      setForm({
        room_id: "",
        guest_name: "",
        guest_email: "",
        guest_phonenumber: "",
        status: "pending",
      });
      setCheckIn(null);
      setCheckOut(null);


    } catch (err) {
      console.error(err);
      alert(err.response?.data.message || "Error creating booking");
    }
  };

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>

      <form onSubmit={handleSubmit}

        className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto"
      >
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
              Room {room.room_number} ({room.room_type}) - P{room.price}
            </option>
          ))}
        </select>

        {/* Guest Info */}
        <input
          type="text"
          name="guest_name"
          placeholder="Guest Name"
          value={form.guest_name}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required />

        <input
          type="email"
          name="guest_email"
          placeholder="Guest email"
          value={form.guest_email}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="text"
          name="guest_phonenumber"
          placeholder="Phone Number"
          value={form.guest_phonenumber}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        {/* Date and Time  */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block">Check-in</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              showTimeSelect
              dateFormat="Pp"
              minDate={checkIn || new Date()}
              className="border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Check-out</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              showTimeSelect
              dateFormat="Pp"
              minDate={checkIn || new Date()}
              className="border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Status</label>
            <select
              name="status"
              value={form.status}
              className="w-full mb-4 p-2 border rounded"
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 transition">
          Create Booking
        </button>
      </form>

    </div>
  )

}