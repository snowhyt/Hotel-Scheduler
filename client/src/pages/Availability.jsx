import React from 'react'
import {useEffect, useState} from "react";
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';

import { getBookings } from "../services/api.js";


const localizer = momentLocalizer(moment);

export default function Availability(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState( new Date());
  const [currentView, setCurrentView] = useState('month');

useEffect(() => {
  fetchBookings();}, []);

  const fetchBookings = async () => {
    try {
      const res = await getBookings();

      if(res.data && Array.isArray(res.data)) {
        const formatted = res.data.map((b) => ({
          title: `${b.guest_name} - Room ${b.room_number}`,
          start: moment(b.check_in).toDate(),
          end: moment(b.check_out).add(1, "hours").toDate()  ,
          status: b.status,
        }));
        setBookings(formatted);
        
      } else {
      console.error("API did not return an array. Received:", res.data);
    }


    } catch (err) {
      console.error("Error fetching bookings: ", err);
    } finally {
      setLoading(false);
    }    
  }

if (loading) return <div className="p-6">Loading...</div>;


return(
  <div className='p-6'>
    <h1 className='text-2xl font-bold mb-4'>Booking Calendar</h1>
    <div>
      <Calendar 
      localizer={localizer}
      events={bookings}
      startAccessor="start"
      endAccessor="end"
      style={{height:700}}
      
      date={currentDate}
      view={currentView}

      onNavigate={(newDate) => setCurrentDate(newDate)}
      onView={(newView) => setCurrentView(newView)}

      eventPropGetter={(bookings) => {
        let bg = '#3b82f6';

        if (bookings.status === "confirmed") bg = "#22c55e"; // green
        if (bookings.status === "pending") bg = "#facc15";   // yellow
        if (bookings.status === "cancelled") bg = "#ef4444"; // red
        if (bookings.status === "completed") bg = "#6b7280"; // gray

        return{
          style: {
            backgroundColor: bg,
            borderRadius: '8px',
            color: 'white',
            border: 'none',
            padding: '2px 4px'
          }
        };
      }}
      />
    </div>
  </div>
)


}



