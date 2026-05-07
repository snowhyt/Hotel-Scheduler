import React, { useState, useEffect } from "react";
import { editRoom } from "../services/api";
import placeholder from "../assets/placeholder.jpg";

export default function EditRoom({ room, onSuccess }) {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    price: "",
    description: "",
    room_capacity: "",
    image: null,        // new file
    image_url: null,    // existing filename
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Populate form when room changes
  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || "",
        room_type: room.room_type || "",
        price: room.price || "",
        description: room.description || "",
        room_capacity: room.room_capacity || "",
        image: null,
        image_url: room.image_url || null, 
      });
    }
  }, [room]);

  // 📝 Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 📤 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      data.append("room_number", formData.room_number);
      data.append("room_type", formData.room_type);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("room_capacity", formData.room_capacity);

      // ✅ Only send new image if selected
      if (formData.image) {
        data.append("image", formData.image);
      }

      await editRoom(room.id, data);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {error}
          </div>
        )}

        {/* Room Number */}
        <div>
          <label className="block text-sm mb-1">Room Number</label>
          <input
            type="number"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm mb-1">Room Type</label>
          <select
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="" hidden>Select Room Type</option>
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
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm mb-1">Capacity</label>
          <input
            type="number"
            name="room_capacity"
            value={formData.room_capacity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Image Preview + Upload */}
        <div className="relative group w-full h-60">
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files[0] })
            }
          />

          <img
            src={
              formData.image
                ? URL.createObjectURL(formData.image)
                : formData.image_url
                ? formData.image_url.startsWith("http")
                  ? formData.image_url
                  : `http://localhost:3000/room_images/${formData.image_url}`
                : placeholder
            }
            alt="room"
            className="w-full h-full object-cover rounded"
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded">
            <label
              htmlFor="imageUpload"
              className="bg-white px-4 py-2 rounded cursor-pointer"
            >
              Change Photo
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Updating..." : "Update Room"}
          </button>

          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 bg-gray-300 py-2 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}