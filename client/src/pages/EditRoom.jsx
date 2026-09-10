import React, { useState, useEffect } from "react";
import { editRoom } from "../services/api";
import placeholder from "../assets/placeholder.jpg";

// 1. Standard types (Strings are fine here)
const PREDEFINED_ROOM_TYPES = [
  "Dome(Ground)", "Dome(Elevated)", "Dormitory", "Family Room",
  "Function Hall", "Junior Suites", "Superior Deluxe", 
  "Superior Double", "Superior Room"
];

// 2. Room Status (Objects: separating the UI label from the DB value)
const PREDEFINED_ROOM_STATUS = [
  { label: "Available", value: "available" },
  { label: "Occupied", value: "occupied" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Inspection", value: "inspection" },
  { label: "Not Available", value: "not_available" },
  { label: "Tenant", value: "tenant" },
  { label: "Under Maintenance", value: "under_maintenance" }
];

export default function EditRoom({ room, onSuccess }) {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    is_active: "",
    price: "",
    description: "",
    room_capacity: "",
    image: null,
    image_url: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI states
  const [isCustomType, setIsCustomType] = useState(false);
  const [isOccupiedStatus, setIsOccupiedStatus] = useState(false);

  // Populate form when room changes
  useEffect(() => {
    if (room) {
      console.log("Raw room data from DB:", room); // Helpful for debugging

      const currentType = room.room_type || "";
      
      // Defensive programming: safely convert, trim spaces, and lowercase the DB value
      const currentStatus = room.is_active 
        ? String(room.is_active).trim().toLowerCase() 
        : "";
      
      const isCustom = currentType !== "" && !PREDEFINED_ROOM_TYPES.includes(currentType);
      const isOccupied = currentStatus === "occupied";
      
      setFormData({
        room_number: room.room_number || "",
        room_type: currentType,
        is_active: currentStatus, 
        price: room.price || "",
        description: room.description || "",
        room_capacity: room.room_capacity || "",
        image: null,
        image_url: room.image_url || null, 
      });

      setIsCustomType(isCustom);
      setIsOccupiedStatus(isOccupied);
    }
  }, [room]);

  // Handle standard input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("room_number", formData.room_number);
      data.append("room_type", formData.room_type);
      data.append("is_active", formData.is_active); 
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("room_capacity", formData.room_capacity);

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
          <div className="bg-red-100 text-red-700 p-2 rounded font-medium">
            {error}
          </div>
        )}

        {/* Room Number */}
        <div>
          <label className="block text-sm mb-1 font-medium">Room Number</label>
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
          <label className="block text-sm mb-1 font-medium">Room Type</label>
          <select
            value={isCustomType ? "Other" : formData.room_type}
            onChange={(e) => {
              if (e.target.value === "Other") {
                setIsCustomType(true);
                setFormData({ ...formData, room_type: "" }); 
              } else {
                setIsCustomType(false);
                setFormData({ ...formData, room_type: e.target.value });
              }
            }}
            className="w-full border p-2 rounded mb-2"
            required
          >
            <option value="" hidden>Select Room Type</option>
            {PREDEFINED_ROOM_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
            <option value="Other">Other (Custom)</option>
          </select>

          {isCustomType && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
              <label className="block text-sm mb-1 text-gray-600">Please specify custom room type:</label>
              <input 
                type="text"
                name="room_type"
                value={formData.room_type}
                onChange={handleChange}
                placeholder="e.g. Presidential Suite"
                className="w-full border p-2 rounded border-blue-400 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
          )}
        </div>

        {/* Room Status */}
        <div>
          <label className="block text-sm mb-1 font-medium">Room Status</label>
          <select 
            value={formData.is_active}
            name="is_active"
            onChange={handleChange}
            className={`w-full border p-2 rounded mb-1 ${
              isOccupiedStatus ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
            }`}
            disabled={isOccupiedStatus} 
            required
          >
            <option value="" hidden>Select Status</option>
            {PREDEFINED_ROOM_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {isOccupiedStatus && (
            <p className="text-xs text-amber-600">
              * Status is locked because the room is currently occupied.
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm mb-1 font-medium">Price</label>
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
          <label className="block text-sm mb-1 font-medium">Capacity</label>
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
          <label className="block text-sm mb-1 font-medium">Description</label>
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
        <div className="relative group w-full h-60 mt-2">
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                setFormData({ ...formData, image: e.target.files[0] });
              }
            }}
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
            className="w-full h-full object-cover rounded border border-gray-200"
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity duration-200">
            <label
              htmlFor="imageUpload"
              className="bg-white px-4 py-2 rounded cursor-pointer font-medium hover:bg-gray-100 transition-colors"
            >
              Change Photo
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t mt-4">
          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Room"}
          </button>
        </div>

      </form>
    </div>
  );
}