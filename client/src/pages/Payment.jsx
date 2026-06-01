import React from 'react'

function Payment() {


  return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-6">Payment</h1>
   
       
         <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto ">
           {/* Room Selection */}
           <select
             name="room_id"
             value={form.room_id}
             onChange={handleChange}
             className="w-full mb-4 p-2 border rounded"
             required
           >
             <option value="">Select Room</option>
             {rooms.map((room) => (
               <option key={room.id} value={room.id}>
                 Room {room.room_number} ({room.room_type}) - ₱{room.price}/night
               </option>
             ))}
           </select>
   
           {/* Guest Info */}
           <input
             type="text"
             name="name"
             placeholder="Guest Name *"
             value={form.name}
             onChange={handleChange}
             className="w-full mb-4 p-2 border rounded"
             required
           />
   
           <input
             type="email"
             name="email"
             placeholder="Guest Email (optional)"
             value={form.email}
             onChange={handleChange}
             className="w-full mb-4 p-2 border rounded"
           />
   
           <input
             type="tel"
             name="phone"
             placeholder="Phone Number *"
             value={form.phone}
             onChange={handleChange}
             className="w-full mb-4 p-2 border rounded"
             required
           />
   
           {/* Date and Time */}
           <div className="grid grid-cols-3 gap-4 mb-4">
             <div>
               <label className="block text-sm font-medium mb-1">Check-in *</label>
               <DatePicker
                 selected={checkIn}
                 onChange={(date) => setCheckIn(date)}
                 showTimeSelect
                 dateFormat="MMMM d, yyyy h:mm aa"
                 minDate={new Date()}
                 className="w-full border p-2 rounded"
                 required
               />
             </div>
   
             <div>
               <label className="block text-sm font-medium mb-1">Check-out *</label>
               <DatePicker
                 selected={checkOut}
                 onChange={(date) => setCheckOut(date)}
                 showTimeSelect
                 dateFormat="MMMM d, yyyy h:mm aa"
                 minDate={checkIn || new Date()}
                 className="w-full border p-2 rounded"
                 required
               />
             </div>
   
             <div className='block'>
               <label className='block text-sm font-medium mb-1'>Status</label>
                 <select name="status" value={form.status} id=""
                 className='w-full border p-2 rounded'>
                   <option value="pending">Pending</option>
                   <option value="confirmed">Confirmedt</option>
                  
                 </select>
               
             </div>
           </div>
   
           {/* Additional Fields */}
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-sm font-medium mb-1">Total Pax</label>
               <input 
                 type="number"
                 name="total_pax"
                 placeholder="Number of guests"
                 value={form.total_pax}
                 onChange={handleChange}
                 min="1"
                 className="w-full p-2 border rounded"
               />
             </div>
   
             <div>
               <label className="block text-sm font-medium mb-1">Amount Paid / Deposit</label>
               <input 
                 type="number"
                 name="amount_paid"
                 placeholder="0.00"
                 value={form.amount_paid}
                 onChange={handleChange}
                 min="0"
                 step="0.01"
                 className="w-full p-2 border rounded"
               />
             </div>
           </div>
   
           {/* Display calculated total (optional preview) */}
           {checkIn && checkOut && form.room_id && (
             <div className="mb-4 p-3 bg-gray-50 rounded">
               <p className="text-sm text-gray-600">Booking Summary:</p>
               {(() => {
                 const selectedRoom = rooms.find(room => room.id === parseInt(form.room_id));
                 const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                 const total = selectedRoom ? selectedRoom.price * nights : 0;
                 return (
                   <>
                     <p className="font-semibold">Nights: {nights}</p>
                     <p className="font-semibold">Total Price: ₱{total.toLocaleString()}</p>
                   </>
                 );
               })()}
             </div>
           )}
   
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
           >
             {loading ? "Creating Booking..." : "Create Booking"}
           </button>
         </form>
       </div>
  )
}

export default Payment