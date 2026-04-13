import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getBookings,
    deleteBooking,
    updateBookingStatus
} from "../services/api.js";

import Modal from "../components/Modal.jsx";
import BookingForm from "../components/BookingForm.jsx";

import { toast } from "react-toastify";



export default function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);



    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await getBookings();
            setBookings(res.data);

        } catch (err) {
            console.error("Error fetchning bookings: ", err);
        } finally {
            setLoading(false);
        }
    };

    //const handleDelete here
    const handleDelete = async (id) => {
        try {
            await deleteBooking(id);
            fetchBookings();
        } catch (err) {
            console.error(err);
        }
    };

    //update status
    const handleStatus = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            fetchBookings();

        } catch (err) {
            console.error(err);
        }
    };


    //filter bookings
    const filteredBookings = bookings.filter((b) => {
        const matchSearch = b.guest_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchStatus = statusFilter
            ? b.status === statusFilter : true;

        return matchSearch && matchStatus;
    });

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
                    className="border p-2 rounded w-full md:w-1/3" />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border py-0 px-2 rounded w-full md:w-auto"
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
                <table className="w-full bg-white shadow rounded-xl min-w-200 md:min-w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-3">Guest</th>
                            <th className="p-3">Room</th>
                            <th className="p-3">Check-in</th>
                            <th className="p-3">Check-out</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="text-sm">
                        {filteredBookings.map((b) => (
                            <tr key={b.id} className="border-t">
                                <td className="p-3">{b.guest_name}</td>
                                <td className="p-3">
                                    {b.room_number} ({b.room_type})
                                </td>
                                <td className="p-3">
                                    {new Date(b.check_in).toLocaleString()}
                                </td>
                                <td className="p-3">
                                    {new Date(b.check_out).toLocaleString()}
                                </td>
                                <td className="p-3 font-bold">
                                    {b.status}
                                </td>

                                <td className="text-[12px] p-1">

                                    {/* confirm button */}
                                    <button


                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to confirm this booking?")) {
                                                if (b.status === "confirmed") {
                                                    toast.error("Booking is already confirmed");
                                                    return;
                                                }
                                                handleStatus(b.id, "confirmed");
                                                toast.success("Booking confirmed successfully");
                                            }

                                        }}
                                        //validations
                                        className="bg-green-500  hover:bg-green-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Confirm
                                    </button>

                                    {/* delete button */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this booking?")) {

                                                handleDelete(b.id);
                                                toast.success("Booking deleted successfully");
                                            }
                                    }}
   
                                        className="bg-red-500  hover:bg-red-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Delete
                                    </button>

                                    <button
                                        onClick={() =>{
                                            if(windows.confirm("Are you sure you want to edit this booking?"))
                                                {
                                                setSelectedBooking(b);
                                                setIsModalOpen(true);
                                                toast.success("Booking edited successfully");
                                            }
                                        
                                    }}
                                        className="bg-purple-500  hover:bg-purple-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Edit
                                    </button>

                                    {/* cancel button */}
                                    <button
                                        onClick={() => {
                                            // validations
                                            if (window.confirm("Are you sure you want to cancel this booking?")) {
                                                if (b.status === "cancelled") {
                                                    toast.error("Booking is already cancelled");
                                                    return;
                                                }
                                                handleStatus(b.id, "cancelled");
                                                toast.success("Booking cancelled successfully");
                                            }
                                        }}
                                        className="bg-yellow-500  hover:bg-yellow-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Cancel
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
                onClose={() => setIsModalOpen(false)}
                title={selectedBooking ? "Edit Booking" : "Create Booking"}>

                <BookingForm
                booking={selectedBooking}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchBookings();
                }} />
            </Modal>

        </div>


    );
}