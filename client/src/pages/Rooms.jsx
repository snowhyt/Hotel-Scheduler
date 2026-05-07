import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import RoomCard from "../components/RoomCard.jsx";
import { deleteRoom } from "../services/api.js";
import EditRoom from "./EditRoom.jsx";
import Modal from "../components/Modal.jsx";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState("table");
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    room_number: "",
    room_type: "",
    price: "",
    description: "",
    image: null,
    room_capacity: "",
  };

  const [form, setForm] = useState(initialForm);

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

    if (!form.room_number || !form.room_type || !form.price || !form.image) {
      toast.error("All fields including image are required");
      return;
    }

    const formData = new FormData();
    formData.append("room_number", form.room_number);
    formData.append("room_type", form.room_type);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("room_capacity", form.room_capacity);
    formData.append("image", form.image); // ✅ matches multer

    try {
      await API.post("/rooms", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Room added!");
      setForm(initialForm);
      e.target.reset(); // clears file input
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add room");
    }
  };

  // 🗑 Delete room
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await deleteRoom(id);
      toast.success("Room deleted!");
      fetchRooms();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Delete failed. There are existing bookings in this room."
      );
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rooms</h1>

      {/* ➕ ADD ROOM FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 flex-wrap text-sm"
      >
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
          value={form.room_type}
          onChange={handleChange}
          className="border rounded p-2"
        >
          <option value="" hidden>
            Select Room Type
          </option>
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
          placeholder="Capacity"
          value={form.room_capacity}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="file"
          name="image"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="border p-2 rounded w-full"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Room
        </button>
      </form>

      {/* VIEW SWITCH */}
      <div className="my-5 inline-flex p-1 bg-neutral-200 rounded-lg">
        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded ${
            view === "table" ? "bg-white shadow" : ""
          }`}
        >
          Table
        </button>
        <button
          onClick={() => setView("card")}
          className={`px-4 py-2 rounded ${
            view === "card" ? "bg-white shadow" : ""
          }`}
        >
          Cards
        </button>
      </div>

      {/* VIEW */}
      {view === "card" ? (
        <div className="flex gap-3 flex-wrap p-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded-xl text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Room #</th>
                <th className="p-2">Type</th>
                <th className="p-2">Price</th>
                <th className="p-2">Capacity</th>
                <th className="p-2">Description</th>
                <th className="p-2">Image</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t">
                  <td className="p-2">{room.room_number}</td>
                  <td className="p-2">{room.room_type}</td>
                  <td className="p-2">₱{room.price}</td>
                  <td className="p-2">{room.room_capacity}</td>
                  <td className="p-2">{room.description}</td>

                  <td className="p-2">
                    <img
                      src={`http://localhost:3000/room_images/${room.image_url}`}
                      alt="room"
                      className="w-16 h-12 object-cover rounded"
                    />
                  </td>

                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {rooms.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No rooms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom(null);
        }}
        title="Edit Room"
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