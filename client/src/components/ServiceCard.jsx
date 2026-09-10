export default function ServiceCard({
    id,
    name,
    price,
    service_type,
    is_active,
    onDelete,
    onEdit,
})
{
    return (
        <div className="flex flex-col h-[300px] w-[200px] bg-white p-4 border rounded-lg shadow text-sm">
        
        {/* Service Status */}
        <h4 className={`
            ${is_active === "active"
            ? "text-green-700"
            : is_active === "not active"
            ? "text-red-700"
            : "text-gray-700"
            }
            `}>
            {is_active?.replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </h4>

        <h5 className="text-lg font-semibold">
             {name} - ({service_type})
        </h5>
        <p className="text-blue-500 font-bold text-xl mb-1">
            ₱{price}
        </p>

        {/* Actions */}
        <div className="mt-auto flex gap-3 justify-center pt-1">
            <button
            onClick={() => onDelete(id)}
            className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded">
                Delete
            </button>

            <button
                onClick={() => onEdit()}
                className ="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
                Edit
            </button>
        </div>

        </div>
    );
}