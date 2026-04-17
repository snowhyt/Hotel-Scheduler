import React from 'react'
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from "react-toastify";
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getBookings } from "../services/api.js";

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

  // const fetchBookings = async () => {
  //   try {
  //     const res = await getBookings();

  //     if (res.data && Array.isArray(res.data)) {
  //       const formatted = res.data.map((b) => ({
  //         id: b.id,
  //         title: `${b.guest_name} - Room ${b.room_number}`,
  //         start: moment(b.check_in).toDate(),
  //         end: moment(b.check_out).toDate(),
  //         status: b.status,
  //         guest_name: b.guest_name,
  //         room_id: b.room_id,
  //         guest_email: b.guest_email,
  //         guest_phonenumber: b.guest_phonenumber,
  //         check_in: b.check_in,
  //         check_out: b.check_out
  //       }));
  //       setBookings(formatted);
  //     } else {
  //       console.error("API did not return an array. Received:", res.data);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching bookings: ", err);
  //     toast.error("Failed to fetch bookings");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

const fetchBookings = async () => {
  try {
    const res = await getBookings();
    
    if (res.data && Array.isArray(res.data)) {
      // No need to check and update - backend already did it!
      const formatted = res.data.map((b) => ({
        id: b.id,
        title: `${b.guest_name} - Room ${b.room_number}`,
        start: moment(b.check_in).toDate(),
        end: moment(b.check_out).toDate(),
        status: b.status, // Already updated by backend
        guest_name: b.guest_name,
        room_id: b.room_id,
        guest_email: b.guest_email,
        guest_phonenumber: b.guest_phonenumber,
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
    console.log("Event clicked:", event);
    setSelectedBooking(event);
    setSelectedDateRange(null);
    setIsModalOpen(true);
  }

  // Single click on empty slot
  const handleSlotClick = (slotInfo) => {
    console.log("Slot clicked:", slotInfo);
    
    let startDate, endDate;
    
    // Different views provide different slotInfo structures
    if (slotInfo.slots && slotInfo.slots.length > 0) {
      // For Week and Day views - multiple slots selected with time
      startDate = slotInfo.slots[0];
      endDate = slotInfo.slots[slotInfo.slots.length - 1];
      
      // If same day, add 2 hours as default duration
      if (moment(startDate).isSame(endDate, 'day')) {
        endDate = moment(startDate).add(2, 'hours').toDate();
      }
    } else if (slotInfo.start) {
      // For Month view - single day
      startDate = slotInfo.start;
      // Default to 1 night stay (check-in to next day)
      endDate = moment(startDate).add(1, 'day').toDate();
    } else {
      // Fallback
      startDate = new Date();
      endDate = moment(startDate).add(1, 'day').toDate();
    }
    
    // VALIDATION: Check if the selected start date is in the past
    if (isPastDate(startDate)) {
      toast.error("Cannot create bookings for past dates. Please select a future date.");
      return; // Don't open the modal
    }
    
    // Optional: Check if end date is also not in the past
    if (isPastDate(endDate) && !moment(endDate).isSame(startDate, 'day')) {
      toast.error("Cannot create bookings that end in the past. Please select valid dates.");
      return;
    }
    
    const newBookingTemplate = {
      check_in: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      check_out: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
      guest_name: '',
      guest_email: '',
      guest_phonenumber: '',
      room_id: '',
    };

    console.log("Creating booking with dates:", newBookingTemplate);
    
    setSelectedBooking(null);
    setSelectedDateRange(newBookingTemplate);
    setIsModalOpen(true);
    
    // Show success toast for valid date selection
    toast.success(`Selected date: ${moment(startDate).format('MMMM DD, YYYY')}`);
  };

  const eventPropGetter = (event) => {
    let bgColor = '#3b82f6'; // default blue
    
    switch(event.status) {
      case 'confirmed':
        bgColor = '#22c55e';
        break;
      case 'pending':
        bgColor = '#facc15';
        break;
      case 'cancelled':
        bgColor = '#ef4444';
        break;
      case 'completed':
        bgColor = '#6b7280';
        break;
      default:
        bgColor = '#3b82f6';
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
            setSelectedBooking(null);
            setSelectedDateRange(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
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