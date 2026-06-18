import React from 'react'
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from "react-toastify";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from "react-router-dom";
import { getAllBookings } from "../services/api.js";

import Modal from "../components/Modal.jsx";
import BookingForm from '../components/BookingForm.jsx';

const localizer = momentLocalizer(moment);

export default function Availability() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

const navigate = useNavigate();
const fetchBookings = async () => {
  try {
    const res = await getAllBookings();
    
    if (res.data && Array.isArray(res.data)) {  
      // No need to check and update - backend already did it!
      const formatted = res.data.map((b) => ({
        id: b.id,
        title: `Room ${b.room_number} - ${b.name.length > 10 ? b.name.substring(0, 10) + '...' : b.name}`,
        start: moment(b.check_in).toDate(),
        end: moment(b.check_out).toDate(),
        status: b.booking_status, // Already updated by backend
       name: b.name,
        room_id: b.room_id,
        email: b.email,
        phonenumber: b.phonenumber,
        check_in: b.check_in,
        check_out: b.check_out
      }));
      setBookings(formatted);
    }
  } catch (err) {
    console.error("Error fetching bookings: ", err);
    toast.error("Failed to fetch bookings");
  } finally {
    setLoading(false);
  }
}

  // Function to check if date is in the past
  const isPastDate = (date) => {
    const today = moment().startOf('day');
    const checkDate = moment(date).startOf('day');
    return checkDate.isBefore(today);
  };

  // Single click on event (booking)
  const handleEventClick = (event) => {
     if (event.status === 'completed') {
    toast.info("This booking is already completed and cannot be edited.");
    return;
  }
       if (event.status === 'cancelled') {
    toast.info("This booking is already cancelled and cannot be edited.");
    return;
  }
  console.log("Event clicked:", event);
  setSelectedBooking(event);
  setSelectedDateRange(null);
  setIsModalOpen(true);

  }

  // Single click on empty slot
  const handleSlotClick = (slotInfo) => {
    console.log("Slot clicked:", slotInfo);

    let selectedDate;

    if(slotInfo.start){
      selectedDate = slotInfo.start;
    } else if (slotInfo.slots && slotInfo.length > 0)
    {
      selectedDate = slotInfo.slots[0];

    } else {
      selectedDate = new Date();
    }

    //set selected empty slot check-in to 2:00pm
    const startDate = moment(selectedDate)
       .hour(14)
       .minute(0)
       .second(0)
       .millisecond(0)
       .toDate();


    const endDate = moment(selectedDate)
    .add(12, 'hours')
    .hour(12)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();

    if(isPastDate(startDate))
    {
      toast.error("Cannot create bookings for past dates. Please select a fututre date.");
      return;
    }

    const newBookingTemplate = {
      check_in: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      check_out: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
      name: '',
      email: '',
      phonenumber: '',
      room_id: '',
    };

    console.log("Creating booking with dates:", newBookingTemplate);
    
    setSelectedBooking(null);
    setSelectedDateRange(newBookingTemplate);
    setIsModalOpen(true);

    toast.success (
      `Selected date: ${moment(startDate).format('MMMM DD, YYYY')} -`
    );


    

    // console.log("Slot clicked:", slotInfo);
    
    // let selectedDate;
    // let startDate, endDate;
    
    // if(slotInfo.start){
    //   selectedDate = slotInfo.start;

    // }


    // // Different views provide different slotInfo structures
    // if (slotInfo.slots && slotInfo.slots.length > 0) {
    //   // For Week and Day views - multiple slots selected with time
    //   startDate = slotInfo.slots[0];
    //   endDate = slotInfo.slots[slotInfo.slots.length - 1];
    //   moment()
    //   // If same day, add 2 hours as default duration
    //   if (moment(startDate).isSame(endDate, 'day')) {
    //     endDate = moment(startDate).add(12, 'hours').toDate();
    //   }
    // } else if (slotInfo.start) {
    //   // For Month view - single day
    //   startDate = slotInfo.start;
    //   // Default to 1 night stay (check-in to next day)
    //   endDate = moment(startDate).add(1, 'day').toDate();
    // } else {
    //   // Fallback
    //   startDate = new Date();
    //   endDate = moment(startDate).add(1, 'day').toDate();
    // }
    
    // // VALIDATION: Check if the selected start date is in the past
    // if (isPastDate(startDate)) {
    //   toast.error("Cannot create bookings for past dates. Please select a future date.");
    //   return; // Don't open the modal
    // }
    
    // // Optional: Check if end date is also not in the past
    // if (isPastDate(endDate) && !moment(endDate).isSame(startDate, 'day')) {
    //   toast.error("Cannot create bookings that end in the past. Please select valid dates.");
    //   return;
    // }
    
    // const newBookingTemplate = {
    //   check_in: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
    //   check_out: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
    //   name: '',
    //   email: '',
    //   phonenumber: '',
    //   room_id: '',
    // };

    // console.log("Creating booking with dates:", newBookingTemplate);
    
    // setSelectedBooking(null);
    // setSelectedDateRange(newBookingTemplate);
    // setIsModalOpen(true);
    
    // // Show success toast for valid date selection
    // toast.success(`Selected date: ${moment(startDate).format('MMMM DD, YYYY')}`);
  };

  const eventPropGetter = (event) => {
    let bgColor = '#3b82f6'; // default blue
    
    switch(event.status) {
      case 'confirmed':
        bgColor = '#1D4ED8';
        break;
      case 'pending':
        bgColor = '#F59E0B';
        break;
      case 'cancelled':
        bgColor = '#B91C1C';
        break;
      case 'completed':
        bgColor = '#CBD5E1';
        break;
      default:
        bgColor = '#314158';
    }

    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        padding: '2px 4px',
        cursor: 'pointer'
      }
    };
  };

  // Custom slot styling - gray out past dates
  const slotPropGetter = (date) => {
    if (isPastDate(date)) {
      return {
        style: {
          cursor: 'not-allowed',
          backgroundColor: '#f3f4f6',
          opacity: 0.5
        },
        className: 'past-date-slot'
      };
    }
    return {
      style: {
        cursor: 'pointer'
      },
      className: 'calendar-slot'
    };
  };

  // Custom day styling for month view
  const dayPropGetter = (date) => {
    if (isPastDate(date)) {
      return {
        className: 'past-day',
        style: {
          backgroundColor: '#f9fafb',
          color: '#9ca3af'
        }
      };
    }
    
    const day = moment(date).day();
    if (day === 0 || day === 6) {
      return {
        className: 'weekend-day',
        style: {
          backgroundColor: '#f9fafb'
        }
      };
    }
    return {};
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setSelectedDateRange(null);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className='p-6'>
      
      
        <div className='flex justify-end'>
        <button
          onClick={() => {
            navigate('/create-booking');
            
          }}
          className="bg-blue-700 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors"
        >
          + New Booking
        </button>
      </div>

      <h1 className='text-2xl font-bold mb-4'>Booking Calendar</h1>
      
      <div>
        <Calendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          date={currentDate}
          view={currentView}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onView={(newView) => setCurrentView(newView)}
          
          // Single click handlers
          onSelectEvent={handleEventClick}
          onSelectSlot={handleSlotClick}
          
          // Make slots selectable
          selectable={true}
          
          // Time settings (these work when switching to week/day views)
          step={30}
          timeslots={2}
          min={moment().hours(8).minutes(0).toDate()}
          max={moment().hours(22).minutes(0).toDate()}
          
          eventPropGetter={eventPropGetter}
          slotPropGetter={slotPropGetter}
          dayPropGetter={dayPropGetter}
          
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day"
          }}
          
          formats={{
            dayFormat: 'DD',
            dateFormat: 'DD',
            monthHeaderFormat: 'MMMM YYYY',
            dayHeaderFormat: 'dddd, MMMM DD',
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
              return `${localizer.format(start, 'MMMM DD', culture)} - ${localizer.format(end, 'MMMM DD', culture)}`;
            },
            timeGutterFormat: 'h:mm a',
            eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
              return `${localizer.format(start, 'h:mm a', culture)} - ${localizer.format(end, 'h:mm a', culture)}`;
            }
          }}
          
          showAllEvents={true}
        />
      </div>
      <div className='flex justify-center mt-4'>
        <fieldset className="border rounded-xl p-5 mb-2 w-100">
          <legend className="px-2 text-md">Legend</legend>
          <div className=' flex gap-3 items-center justify-evenly  mb-2'>
            <div className='inline-flex gap-2 items-center'>
                <div className="w-5 h-5 bg-blue-700 rounded"></div>
                <p>Confirmed</p>
            </div>
            <div className='inline-flex gap-2 items-center'>
                <div className="w-5 h-5 bg-amber-500 rounded"></div>
                <p>Pending</p>
            </div>
             <div className='inline-flex gap-2 items-center'>
                <div className="w-5 h-5 bg-red-700 rounded"></div>
                <p>Cancelled</p>
            </div>
            <div className='inline-flex gap-2 items-center'>
                <div className="w-5 h-5 bg-slate-300 rounded"></div>
                <p>Completed</p>
            </div>
              <div className='inline-flex gap-2 items-center'>
                <div className="w-5 h-5 bg-slate-700 rounded"></div>
                <p>Default</p>
            </div>
          </div>
        </fieldset>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedBooking ? "Edit Booking" : "Create New Booking"}
      >
        <BookingForm
          booking={selectedBooking || selectedDateRange}
          onSuccess={() => {
            handleCloseModal();
            fetchBookings();
            toast.success('Booking saved successfully!', {
              icon: '✅',
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            });
          }}
          onError={() => {
            toast.error('Failed to save booking. Please try again.', {
              icon: '❌',
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            });
          }}
        />
      </Modal>
    </div>
  );
}