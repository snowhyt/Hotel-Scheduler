import React from 'react'

export default function RoomCard({ room_number, room_type, price, description, image_url }) {
  return (

    

<div className="flex flex-col w-[350px] h-[500px] bg-white block max-w-sm p-6 border border-default-medium rounded-lg shadow-xs">
    <div>
    <a href="#">
        <img className="rounded-md overflow-hidden object-cover w-full h-48 mb-6" src={`http://localhost:3000/room_images/${image_url}`}  alt="" />
    </a>
    <a href="#">
        <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">
            {room_number} - {room_type}
        </h5>
    </a>
    <p className="mb-6 text-body">{description}</p>
    </div>
    <div className='flex flex-1'></div>
    <div className='flex gap-4 bg-amber-200 justify-center'>
        <button className='bg-red-500 text-white px-1 py-1 rounded'>Delete</button>
        <button className='bg-green-500 text-white px-1 py-1 rounded'>Edit</button>
    </div>
   
</div>

    // <div>
    //         <div className="max-w-sm rounded overflow-hidden shadow-lg">
    //             <img className="w-full" src={`http://localhost:3000/room_images/${image_url}`} 
    //             alt={`${room_number} - ${room_type}`}
    //             width='100px'
    //             height='100px'
    //             />
    //             <div className="px-6 py-4">
    //                 <div className="font-bold text-xl mb-2">{room_number} - {room_type}</div>
    //                 <h3>
    //                     {price}
    //                 </h3>
    //                 <p className="text-gray-700 text-base">
    //                     {description}
    //                 </p>
    //             </div>
              
    //         </div>

            

    //     </div>

  )
}
