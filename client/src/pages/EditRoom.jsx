import React, {useState, useEffect} from 'react'
import { editRoom, getRooms} from '../services/api'
import moment from 'moment'


export default function EditRoom({room, onSuccess}) {

//useState
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    price: '',
    room_capacity: '',
    description: '',
    image_url: null,
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


//fetch rooms
// useEffect(()=> {
//   fetchRooms();
// }, []);

//populate form when rooms prop changes
useEffect(() => {
  if (room) {
    setFormData({
      room_number: room.room_number || '',
      room_type: room.room_type || '',
      price: room.price || '',
      description: room.description || '',
      room_capacity: room.room_capacity || '',
      image_url: room.image_url || null,
    });
  }
}, [room]);

// const fetchRooms = async () => {

//   try {
//     const response = await getRooms();
//     if(response.data && Array.isArray(response.data)){
//       setRooms(response.data);

//     }
    
//   } catch (err) {
//       console.error("Error fetching rooms:", err);

//   }
// };

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    if (room && room.id) {
      // Update existing room
      await editRoom(room.id, formData);
  }
  onSuccess();
  } catch (err) {
    console.error("Error saving room:", err);
    setError(err.response?.data?.message || "Failed to save room");
    } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>

        )}
        <fieldset className='border-2 border-blue-300 rounded-xl p-4'>
          <legend className="px-4 text-xl">Room Information</legend>
        
          <div>
            <label className='block text-left text-sm font-medium mb-1'>Room Number</label>
            <input 
            type="number"
            name = "room_number"
            value = {formData.room_number}
            onChange = {handleChange}
            required
            className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

        {room && room.id &&(
          <div>
            <label className='block text-left text-sm font-medium mb-1'>Room Type</label>
            <select 
            name="room_type" 
            value={formData.room_type} 
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            
            >
              <option value="" hidden disabled>Select Room room_type</option>
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
        )}

        <div>
          <label className='block text-left text-sm font-medium mb-1'>Price</label>
          <input type="number"
          name = "price"
          value = {formData.price}
          onChange = {handleChange}
          required
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

         <div>
          <label className='block text-left text-sm font-medium mb-1'>Description</label>
          <textarea
          rows={5}
          name = "description"
          value = {formData.description}
          onChange = {handleChange}
          required
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

         <div>
          <label className='block text-left text-sm font-medium mb-1'>Capacity</label>
          <input type="number"
          name = "room_capacity"
          value = {formData.room_capacity}
          onChange = {handleChange}
          required
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

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

          <div>
            <a href="">
              <img className='rounded-md overflow-hidden object-cover w-full h-48 mb-6' 
              src=
              {formData.image_url
                ? `http://localhost:3000/room_images/${formData.image_url}`
                : '../assets/vite.png'
              } 
              alt={formData.room_number + ' ' + formData.room_type}
              
              />
            </a>
          </div>

        
        </fieldset>
        <div className='flex gap-3 pt-4'>
          <button
          type='submit'
          disabled={loading}
           className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
           >
            Update Room
          </button>
          <button 
          type="button"
          onClick={onSuccess}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
          >Cancel</button>
        </div>
      </form>

    </div>
  )
}

