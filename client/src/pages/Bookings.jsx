import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getBookings,
    deleteBooking,
    updateBookingStatus
} from "../services/api.js";

import Modal from "../components/Modal.jsx";
import BookingForm from "../components/BookingForm.jsx";
import ViewBookingForm from "../components/ViewBookingForm.jsx";

import { toast } from "react-toastify";

export default function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [viewMode, setViewMode] = useState(null);
   

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings();
            console.log("Fetched bookings:", res.data); // Debug log
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings: ", err);
            toast.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await deleteBooking(id);
            toast.success("Booking deleted successfully");
            fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete booking");
        }
    };

    // Update status
    const handleStatus = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            toast.success(`Booking ${status} successfully`);
            fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error(`Failed to ${status} booking`);
        }
    };

    // Filter bookings
    const filteredBookings = bookings.filter((b) => {
        const matchSearch = b.name
            ?.toLowerCase()
            .includes(search.toLowerCase()) || false;

        const matchStatus = statusFilter
            ? b.status === statusFilter : true;

        return matchSearch && matchStatus;
    });

    //modal conditions
    let modalTitle = "Create a Booking";
    
    if(viewMode){
        modalTitle = "View Booking"
    } else if (selectedBooking) {
        modalTitle = "Edit Booking";
    }

  

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Bookings</h1>

            {/* Filter UI */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search guest"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded w-full md:w-1/3"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border py-2 px-2 rounded w-full md:w-auto"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow rounded-xl">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-3">Guest</th>
                            <th className="p-3">Room</th>
                            <th className="p-3">Check-in</th>
                            <th className="p-3">Check-out</th>
                            <th className="p-3">TotalPax</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm">
                        {filteredBookings.map((b) => (
                            <tr key={b.id} className="border-t">
                                <td className="p-3">{b.name}</td>
                                <td className="p-3">
                                    {b.room_number} ({b.room_type})
                                </td>
                                <td className="p-3">
                                    {new Date(b.check_in).toLocaleString()}
                                </td>
                                <td className="p-3">
                                    {new Date(b.check_out).toLocaleString()}
                                </td>
                                 {/* total pax */}
                                <td className="p-3">
                                    {b.total_pax}
                                </td>

                                <td className="p-3 font-bold">
                                    <span className={`px-2 py-1 rounded ${
                                        b.status === 'confirmed' ? 'text-green-500' :
                                        b.status === 'pending' ? 'text-yellow-500' :
                                        b.status === 'cancelled' ? 'text-red-500' :
                                        'text-gray-500'
                                    }`}>
                                        {b.status}
                                    </span>
                                </td>
                            

                                <td className="p-1">

                                    {/* View button */}
                                    <button
                                        onClick={() => {
                                            setViewMode(b);
                                            setIsModalOpen(true);
                                        }}
                                        disabled={b.status !== "pending"}
                                        className={`bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-2 py-1 rounded m-1 ${
                                            (b.status !== "pending") ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                       View
                                    </button>

                                    {/* Confirm button */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to confirm this booking?")) {
                                                if (b.status === "confirmed") {
                                                    toast.error("Booking is already confirmed");
                                                    return;
                                                }
                                                if (b.status === "cancelled") {
                                                    toast.error("Cannot confirm a cancelled booking");
                                                    return;
                                                }
                                                handleStatus(b.id, "confirmed");
                                            }
                                        }}
                                        disabled={b.status !== "pending"}
                                        className={`bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-2 py-1 rounded m-1 ${
                                            (b.status !== "pending") ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        Confirm
                                    </button>

                                    {/* Cancel button */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to cancel this booking?")) {
                                                if (b.status === "cancelled") {
                                                    toast.error("Booking is already cancelled");
                                                    return;
                                                }
                                                if (b.status === "completed") {
                                                    toast.error("Cannot cancel a completed booking");
                                                    return;
                                                }
                                                handleStatus(b.id, "cancelled");
                                            }
                                        }}
                                        disabled={b.status !== "pending"}
                                        className={`bg-slate-500 hover:bg-slate-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-2 py-1 rounded m-1 ${
                                            (b.status === "cancelled" || b.status === "completed") ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        Cancel
                                    </button>

                                    {/* Edit button */}
                                    <button
                                        onClick={() => {
                                            setSelectedBooking(b);
                                            setIsModalOpen(true);
                                        }}
                                        className="bg-amber-500 hover:bg-amber-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Edit
                                    </button>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this booking?")) {
                                                handleDelete(b.id);
                                            }
                                        }}
                                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredBookings.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center p-4">
                                    No bookings found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setViewMode(false);
                    setIsModalOpen(false);
                    setSelectedBooking(null);
                    

                }}
                
                title={modalTitle}
            >
              {viewMode ? (
                <ViewBookingForm
                    booking = {selectedBooking}
                    onSuccess = {() => {
                        setViewMode(false);
                        setIsModalOpen(false);
                        fetchBookings();
                    }} 
                />) : (
                    <BookingForm
                        booking = {selectedBooking}
                        onSuccess={() => {
                            setIsModalOpen(false);
                            setSelectedBooking(null);
                            fetchBookings();
                        }}
                    />
                )
            
            }
            </Modal>

        </div>
    );
}