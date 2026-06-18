import { useEffect, useState } from "react";
import ExcelModal from "../components/ExcelModal.jsx";
import { getAllBookings, updateBookingStatus } from "../services/api.js";

import Modal from "../components/Modal.jsx";
import BookingForm from "../components/BookingForm.jsx";
import PayBookingForm from "../components/PayBookingForm.jsx";

import { toast } from "react-toastify";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      console.log("Fetched bookings:", res.data); // Debug log
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings: ", err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const handleStatus = async (id, booking_status) => {
    try {
      await updateBookingStatus(id, booking_status);
      toast.success(`Booking ${booking_status} successfully`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${booking_status} booking`);
    }
  };

  // Filter bookings by status
  const filteredBookings = bookings.filter((b) => {
    //filter by name
    const matchSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) || false;
    //filter by booking_status
    const matchStatus = statusFilter
      ? b.booking_status.toLowerCase() === statusFilter
      : true;
    //filter by month
    const checkInMonth = new Date(b.check_in).getMonth() + 1;
    const checkOutMonth = new Date(b.check_out).getMonth() + 1;
    const matchMonth = monthFilter
      ? checkInMonth <= monthFilter && checkOutMonth >= monthFilter
      : true;

    //filter by year
    const checkInYear = new Date(b.check_in).getFullYear();
    const checkOutYear = new Date(b.check_out).getFullYear();
    const matchYear = yearFilter
      ? checkInYear === yearFilter || checkOutYear === yearFilter
      : true;


    return matchSearch && matchStatus && matchMonth  && matchYear;
  });

  //modal conditions
  let modalTitle = "View/Edit Booking";

  // if (viewMode) {
  //   modalTitle = "Pay Booking";
  // } else if (selectedBooking) {
  //   modalTitle = "View/Edit Booking";
  // }

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
          name="booking_status"
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

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(Number(e.target.value))}
          className="text-sm border py-2 px-2 rounded w-full md:w-auto"
        >
          <option value="">All Months</option>
          <option value={1}>January</option>
          <option value={2}>February</option>
          <option value={3}>March</option>
          <option value={4}>April</option>
          <option value={5}>May</option>
          <option value={6}>June</option>
          <option value={7}>July</option>
          <option value={8}>August</option>
          <option value={9}>September</option>
          <option value={10}>October</option>
          <option value={11}>November</option>
          <option value={12}>December</option>
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(Number(e.target.value))}
          className="text-sm border py-2 px-2 rounded w-full md:w-auto"
        >
          <option value="">All Years</option>
          {Array.from(
                { length: 10},
                (_, i) => new Date().getFullYear() + i
                ).map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
                ))}
        </select>
        <div className="flex-1"></div>
        <button
          onClick={() => {
            setIsExcelModalOpen(true);
          }}
          className="bg-green-700 hover:bg-green-400 text-white p-2 rounded text-sm"
        >
          Export To Excel
        </button>
      </div>

      {/* Table */}
      <div className="h-150 overflow-y-auto">
        <table className="w-full bg-white shadow rounded-xl">
          <thead>
            <tr className="bg-gray-200 sticky top-0 z-10">
              <th className="p-3">Guest</th>
              <th className="p-3">Room</th>
              <th className="p-3">Check-in</th>
              <th className="p-3">Check-out</th>

              <th className="p-3">Status</th>
              <th className="p-3">Payment Status</th>
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
                <td className="p-3">{new Date(b.check_in).toLocaleString()}</td>
                <td className="p-3">
                  {new Date(b.check_out).toLocaleString()}
                </td>

                <td className="p-3 font-bold uppercase">
                  <span
                    className={`px-2 py-1 rounded ${
                      b.booking_status === "confirmed"
                        ? "text-green-500"
                        : b.booking_status === "pending"
                          ? "text-yellow-500"
                          : b.booking_status === "cancelled"
                            ? "text-red-500"
                            : "text-gray-500"
                    }`}
                  >
                    {b.booking_status}
                  </span>
                </td>

                <td className="p-3 font-bold uppercase">
                  <span
                    className={`px-2 py-1 rounded ${
                      b.invoice_status === "paid"
                        ? "text-slate-700"
                        : b.invoice_status === "partial"
                          ? "text-yellow-500"
                          : b.invoice_status === "unpaid"
                            ? "text-red-500"
                            : "text-gray-500"
                    }`}
                  >
                    {b.invoice_status}
                  </span>
                </td>

                <td className="p-1">
                  {/* View button */}
                  <button
                    onClick={() => {
                      setSelectedBooking(b);

                      setViewMode(b);
                      setIsModalOpen(true);
                    }}
                    disabled={b.invoice_status === "paid"}
                    className={`bg-blue-700 hover:bg-blue-400 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-1 rounded m-1 ${
                      b.invoice_status === "paid"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Pay
                  </button>

                  {/* Confirm button */}
                  {/* <button
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
                                        className={`bg-blue-700 hover:bg-blue-400 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-2 py-1 rounded m-1 ${
                                            (b.status !== "pending") ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        Confirm
                                    </button> */}

                  {/* Cancel button */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to cancel this booking?",
                        )
                      ) {
                        if (b.booking_status === "cancelled") {
                          toast.error("Booking is already cancelled");
                          return;
                        }
                        if (b.booking_status === "completed") {
                          toast.error("Cannot cancel a completed booking");
                          return;
                        }
                        handleStatus(b.id, "cancelled");
                      }
                    }}
                    disabled={b.booking_status !== "pending"}
                    className={`bg-white hover:bg-red-500 border hover:text-white disabled:bg-red-300 disabled:text-white disabled:cursor-not-allowed px-2 py-1 rounded m-1 ${
                      b.booking_status === "cancelled" ||
                      b.booking_status === "completed"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
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
                    className="bg-slate-700 hover:bg-slate-400 text-white px-2 py-1 rounded m-1"
                  >
                    Edit/View
                  </button>

                  {/* Delete button */}
                  {/* <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this booking?")) {
                                                handleDelete(b.id);
                                            }
                                        }}
                                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded m-1"
                                    >
                                        Delete
                                    </button> */}
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
          <PayBookingForm
            booking={selectedBooking}
            onSuccess={() => {
              setViewMode(false);
              setIsModalOpen(false);
              fetchBookings();
            }}
          />
        ) : (
          <BookingForm
            booking={selectedBooking}
            onSuccess={() => {
              setIsModalOpen(false);
              setSelectedBooking(null);
              fetchBookings();
            }}
          />
        )}
      </Modal>

      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => {
          setIsExcelModalOpen(false);
        }}
        title="Export To Excel"
        >

        </ExcelModal>
    </div>
  );
}
