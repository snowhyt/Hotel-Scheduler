
export default function RoomCard({
  id,
  room_number,
  is_active,
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

      {/* Room Status */}
      <h4 className={`text-lg
            mb-2
          ${is_active === "available"
          ? "text-green-700"
          : is_active === "Booked"
          ? "text-blue-700"
          : is_active === "cleaning"
          ? "text-yellow-700"
          :is_active === "inspection"
          ? "text-purple-700"
          :is_active === "not_available"
          ? "text-red-700"
          :is_active === "tenant"
          ? "text-slate-700"
          : is_active === "under_maintenance"
          ? "text-orange-700"
          : "text-gray-700"
          }`}>
        {is_active
          ?.replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())}
      </h4>

      {/* Image */}
      <img
        className="rounded-md object-cover w-full h-30 mb-3"
        src={`http://localhost:3000/room_images/${image_url}`}
        alt="room"
      />

      {/* Title */}
      <h5 className="text-lg font-semibold">
        {room_number} - {room_type}
      </h5>

      {/* Price */}
      <p className="text-blue-500 font-bold mb-1">
        ₱{price}
      </p>

        
      {/* Capacity */}
      
      <p className="text-gray-600 text-md">
        Total Room Capacity: {room_capacity}
      </p>

      {/* Description */}
      <p className="text-gray-400 text-sm line-clamp-5 overflow-y-scroll">
        {description}
      </p>

      {/* Actions */}
      <div className="mt-auto flex gap-3 justify-center pt-1">
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