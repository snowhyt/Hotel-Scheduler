//imports
import React, { useState, useEffect } from "react";
import {
  getAllBookings,
  getAllPayments,
  getAllInvoices,
} from "../services/api";
import moment from "moment";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExcelModal({ isOpen, onClose, title }) {
  const [loading, setLoading] = useState(false);
  //const [error, setError] = useState(null)
  const [fromDateFilter, setFromDateFilter] = useState(null);
  const [toDateFilter, setToDateFilter] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  //fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
    
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings: ", err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  //fetch Payments
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPayments();
  
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments: ", err);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  //fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getAllInvoices();
    
      setInvoices(res.data);
    } catch (err) {
      console.error("Error fetching invoices: ", err);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    //by date
    const checkInDate = new Date(b.check_in);
    const checkOutDate = new Date(b.check_out);

    const matchDateRange =
      (!fromDateFilter || checkInDate >= fromDateFilter) &&
      (!toDateFilter || checkOutDate <= toDateFilter);

    console.log({
      name: b.name,
      check_in: b.check_in,
      check_out: b.check_out,
      checkInDate,
      checkOutDate,
      fromDateFilter,
      toDateFilter,
      matchDateRange,
    });

    const matchBookingStatus = bookingStatusFilter
      ? b.booking_status.toLowerCase() === bookingStatusFilter
      : true;

    const matchPaymentStatus = paymentStatusFilter
      ? b.invoice_status.toLowerCase() === paymentStatusFilter
      : true;

    return matchDateRange && matchBookingStatus && matchPaymentStatus;
  });

  const selectedBookingIDs = filteredBookings.map((b) => b.id);

  const filteredPayments = payments.filter((p) => {
    return selectedBookingIDs.includes(p.booking_id);
  });

  const filteredInvoices = invoices.filter((i) => {
    return selectedBookingIDs.includes(i.booking_id);
  });



  const exportToExcel = () => {
    if (filteredBookings.length === 0) {
      toast.warning("No records to report");
      return;
    }

    const bookingExcelData = filteredBookings.map((b) => ({
      Booking_id: b.id,
      Guest: b.name,
      Room: `${b.room_number} (${b.room_type})`,
      "Check-in": new Date(b.check_in).toLocaleString(),
      "Check-out": new Date(b.check_out).toLocaleString(),
      "Booking Status": b.booking_status,
      "Invoice Status": b.invoice_status,
      Email: b.email,
      Phone: b.phone,
      Address: b.address,
      "Total Pax": b.total_pax,
    }));

    const paymentExcelData = filteredPayments.map((p) => ({
      Payment_id: p.id,
      Booking_id: p.booking_id,
      Amount: p.amount,
      Payment_type: p.payment_type,
      Payment_method: p.payment_method,
      Payment_status: p.payment_status,
    }));

    const invoiceExcelData = filteredInvoices.map((i) => ({
      Invoice_id: i.id,
      Booking_id: i.booking_id,
      "Invoice Number": i.invoice_number,
      "Early CheckIn Fee": i.early_checkin_fee || 0,
      "Custom Charge": i.custom_charge || 0,
      "Custom Charge Name": i.custom_charge_name || "N/A",
       "Service Charge": i.service_charge || 0,
      "Additional Pax": i.additional_pax || 0,
      "Pax Charge": i.additional_pax_charge || 0,
      "Breakfast Package": i.breakfast_package || "N/A",
      "Room Charge": i.room_charge,
      Subtotal: i.subtotal,
      "Discount Rate": i.discount,
      "Discount Amount": (Number(i.discount) * Number(i.subtotal)) || 0,
      GrandTotal: i.grandtotal,
      "Amount Paid": i.amount_paid,
      "Balance": i.balance_due || 0,
      "Invoice Status": i.invoice_status,
      issued_date: i.issued_date,
      
    }));

    //create worksheet
    const worksheet1 = XLSX.utils.json_to_sheet(bookingExcelData);
    const worksheet2 = XLSX.utils.json_to_sheet(paymentExcelData);
    const worksheet3 = XLSX.utils.json_to_sheet(invoiceExcelData);


    //Auto column widths
    worksheet1["!cols"] = [
        {wch: 10},
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
    ];

    //Auto column widths
    worksheet2["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
    ];

    worksheet3["!cols"] = [
      {wch: 10},
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
    ];

    //create workbook
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet1, "Bookings");

    XLSX.utils.book_append_sheet(workbook, worksheet2, "Payments");

    XLSX.utils.book_append_sheet(workbook, worksheet3, "Invoices");

    //Generate file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      fileData,
      `Bookings_Report_${moment().format("YYYY-MM-DDHHmmss")}.xlsx`,
    );
    toast.success("Excel file exported successfully");
  };

  const handleFromDateChange = (e) => {
    if (!e.target.value) {
      setFromDateFilter(null);
      return;
    }
    const date = new Date(e.target.value);
    setFromDateFilter(date);
  };

  const handleToDateChange = (e) => {
    if (!e.target.value) {
      setToDateFilter(null);
      return;
    }
    const date = new Date(e.target.value);
    setToDateFilter(date);
  };

  // const handleChange = (e) => {
  //     const {name, value} = e.target;
  //     setFormData(prev => ({...prev, [name]: value}));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //validations
    if (fromDateFilter === null) {
      toast.error("Please select FROM date");
      return;
    }
    if (toDateFilter === null) {
      toast.error("Please select TO date");
      return;
    }

    if (toDateFilter < fromDateFilter) {
      toast.error("TO date cannot be before FROM date");
      return;
    }

    if (fromDateFilter || toDateFilter) {
      const confirmed = window.confirm(
        "Are you sure you want to export this data?",
      );
      if (!confirmed) return;
    }

    try {
     setLoading(true);
    exportToExcel();       
    } catch (error) {
        console.error("Error exporting to Excel: ", error);
        toast.error("Failed to export to Excel");
    }
    finally {
      setLoading(false);
    }

  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-xl bg-white shadow-lg w-4xl h-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button onClick={onClose} className="text-black">
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <fieldset className="border p-4 rounded-xl">
            <legend>Select Date Range</legend>
            <div className="flex gap-4">
              <div className="w-full">
                <label className="block text-left text-sm  p-1 font-bold">
                  From:
                </label>
                <input
                  type="date"
                  className="border p-2 rounded w-full "
                  value={
                    fromDateFilter instanceof Date && !isNaN(fromDateFilter)
                      ? moment(fromDateFilter).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={handleFromDateChange}
                  name="fromDateFilter"
                />
              </div>
              <div className="w-full">
                <label className="block text-left text-sm  p-1 font-bold">
                  To:
                </label>
                <input
                  type="date"
                  name="toDateFilter"
                  value={
                    toDateFilter instanceof Date && !isNaN(toDateFilter)
                      ? moment(toDateFilter).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={handleToDateChange}
                  className="border p-2 rounded w-full "
                />
              </div>
            </div>
            <div className="flex gap-4 p-1">
              <div className="w-full">
                <label className="block text-left text-sm  p-1 font-bold">
                  Booking Status:
                </label>
                <select
                  name="booking_status"
                  className="border p-2 rounded w-full"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="">All Booking Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-left text-sm  p-1 font-bold">
                  Payment Status:
                </label>
                <select
                  name="payment_status"
                  className="border p-2 rounded w-full"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Payment Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Table */}
          <div className="h-100 overflow-y-auto  bg-white shadow rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 sticky top-0 z-10">
                  <th className="p-3">Guest</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>

                  <th className="p-3">Status</th>
                  <th className="p-3">Payment Status</th>
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

          <div className="flex mt-4 gap-4 justify-center items-end">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-400 text-white px-4 py-2 w-full rounded transition-colors"
            >
              {loading ? "Exporting..." : "Export"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-red-500 border hover:text-white px-4 py-2 w-full rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
