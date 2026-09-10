import React, { useState, useEffect } from "react";
import { editService } from "../services/api";


// 1. Standard types (Strings are fine here)
const PREDEFINED_SERVICE_TYPES = [
"laundry", "hotel"
];

const   PREDEFINED_SERVICE_STATUS = [
  "active", "not_active"
]


export default function EditService({ service, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    service_type: "",
    price: "",
    is_active: "",
  });

  const [isActiveStatus, setIsActiveStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  // Populate form when service changes
  useEffect(() => {
    if (service) {
      console.log("Raw service data from DB:", service); // Helpful for debugging

      // const currentType = service.service_type || "";
      
      // Defensive programming: safely convert, trim spaces, and lowercase the DB value
      const currentStatus = service.is_active 
        ? String(service.is_active).trim().toLowerCase() 
        : "";
      
      setFormData({
        name: service.name || "",
        price: service.price || "",
        service_type: service.service_type || "",
        is_active: service.is_active || "",
      });

      // setIsCustomType(isCustom);
      setIsActiveStatus(isOccupied);
    }
  }, [service]);

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

      await editService(service.id, data);
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

        {/* Service Name */}
        <div>
          <label className="block text-sm mb-1 font-medium">Service Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm mb-1 font-medium">Service Type</label>
          <select
            value={formData.service_type}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-2"
            required
          >
            <option value="" hidden>Select Service Type</option>
            {PREDEFINED_SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
           
          </select>

        </div>

        {/* Service Status */}

        <div>
          <label className="block text-sm mb-1 font-medium">Service Status</label>
          <select 
            value={formData.is_active}
            name="is_active"
            onChange={handleChange}
            className={`w-full border p-2 rounded mb-1 ${
              isActiveStatus ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
            }`}
            disabled={iActiveStatus} 
            required
          >
            <option value="" hidden>Select Status</option>
            {PREDEFINED_SERVICE_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {isActiveStatus && (
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