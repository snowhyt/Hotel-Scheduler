import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import RoomCard from "../components/RoomCard.jsx"
import {
  getRooms,
  deleteRoom,
  addRooms
} from "../services/api.js";
import { useNavigate } from "react-router-dom";

import EditRoom from "./EditRoom.jsx";
import Modal from "../components/Modal.jsx";




export default function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    price: "",
    description: "",
    image: null,
    room_capacity: "",
  });


  const [view, setView] = useState('table'); // 'card' or 'table


  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchRooms();
  }, []);

  // 📡 Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add room
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validations before preparing FormData
    if (!form.room_number || !form.room_type || !form.price || !form.image) {
      toast.error("All fields including the image are required");
      return;
    }

    const formData = new FormData();
    formData.append("room_number", form.room_number);
    formData.append("room_type", form.room_type);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("image", form.image);
    formData.append("room_capacity", form.room_capacity);

    try {
      //add rooms
      await API.post("/rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Room added!");

      //reset
      setForm({
        room_number: "",
        room_type: "",
        price: "",
        description: "",
        image: null,
        room_capacity: "",
      });

      e.target.reset(); // Clear the file input visually
      fetchRooms();
    } catch (err) {
      console.error("Add Room Error:", err);
      const message = err.response?.data?.message || "Failed to add room";
      toast.error(message);
    }
  };

  // 🗑 Delete room
  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await deleteRoom(id);
      toast.success("Room deleted!");
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed. There are existing bookings in this room.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rooms</h1>

      {/* ➕ ADD ROOM FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 flex-wrap"
      >
        <div className="p-2 flex gap-4">

          <input
            type="text"
            name="room_number"
            placeholder="Room Number"
            value={form.room_number}
            onChange={handleChange}
            className="border p-2 rounded"
          />

            <select 
            name="room_type"
            id="room_type"
            value={form.room_type}
            onChange={handleChange}
             className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" hidden disabled>Select Room Type</option>
              <option value="Dome">Dome</option>
              <option value="Dormitory">Dormitory</option>
              <option value="Family Room">Family Room</option>
              <option value="Function Hall">Function Hall</option>
              <option value="Junior Suites">Junior Suites</option>
              <option value="Superior Deluxe">Superior Deluxe</option>
              <option value="Deluxe Double">Deluxe Double</option>
              <option value="Superior Room">Superior Room</option>
              <option value="Other">Other</option>
            </select>

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="room_capacity"
            placeholder="Room Capacity"
            value={form.room_capacity}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div>

            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           file:mr-2 file:py-1 file:px-1
           file:rounded-l-lg file:border-0
           file:text-sm file:font-semibold
           file:bg-gray-200 file:text-gray-700
           hover:file:bg-gray-300 transition-all"
              aria-describedby="file_input_help"
              id="file_input"
              type="file"
              name="image"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] })
              }
            />

            <p className=" text-xs text-gray-500" id="file_input_help">
              SVG, PNG, JPG or GIF (MAX. 800x400px).
            </p>
          </div>

        </div>






        <textarea
          name="description"
          placeholder="Room Description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          className="border p-2 rounded w-full"
        ></textarea>

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Room
        </button>
      </form>




      <div className="my-5 inline-flex p-1 bg-neutral-200/50 rounded-lg border border-neutral-300">
        <button
          onClick={() => setView('table')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'
            }`}
        >
          Table
        </button>
        <button
          onClick={() => setView('card')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'card' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'
            }`}
        >
          Cards
        </button>
      </div>

      {/* Conditional Rendering */}
      {view === 'card' ? (
        <div>
          <div className="flex gap-3 pt-[20px]">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room_number={room.room_number}
                room_type={room.room_type}
                price={room.price}
                description={room.description}
                image_url={room.image_url} />

            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* 📋 ROOMS TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="w-full bg-white shadow rounded-xl">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Room #</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t">
                    <td className="p-1">{room.room_number}</td>
                    <td className="p-1">{room.room_type}</td>
                    <td className="p-1">₱{room.price}</td>
                    <td className="p-1">{room.room_capacity}</td>
                    <td className="p-1">{room.description}</td>
                    <td className="p-1">{room.image_url}</td>

                    <td className="p-1 flex gap-2 justify-center">
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No rooms found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )};

      <Modal
        isOpen={isModalOpen}
        onClose = {() =>{
          setIsModalOpen(false);
          setSelectedRoom(false);
          fetchRooms();
        }}
      >
        <EditRoom
        room={selectedRoom}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedRoom(null);
          fetchRooms();
        }}
        
        />
      </Modal>
    </div>



  );
}