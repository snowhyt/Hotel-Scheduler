import React from "react";

export default function RoomCard({
  id,
  room_number,
  room_type,
  price,
  description,
  room_capacity,
  image_url,
  onDelete,
  onEdit,
}) {
  return (
    
    <div className="flex flex-col h-[450px] w-[280px] bg-white p-4 border rounded-lg shadow text-sm">

      {/* Image */}
      <img
        className="rounded-md object-cover w-full h-48 mb-3"
        src={`http://localhost:3000/room_images/${image_url}`}
        alt="room"
      />

      {/* Title */}
      <h5 className="text-lg font-semibold mb-1">
        {room_number} - {room_type}
      </h5>

      {/* Price */}
      <p className="text-blue-500 font-bold mb-2">
        ₱{price}
      </p>


      {/* Capacity */}
      
      <p className="text-gray-500 pt-2 text-md line-clamp-3">
        Total Room Capacity: {room_capacity}
      </p>

      {/* Description */}
      <p className="text-gray-600 text-sm line-clamp-3">
        {description}
      </p>

      {/* Actions */}
      <div className="mt-auto flex gap-3 justify-center pt-4">
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Delete
        </button>

        <button
          onClick={() => onEdit()}
          className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Edit
        </button>
      </div>
    </div>
  );
}