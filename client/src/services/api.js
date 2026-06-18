    import axios from "axios";

const API = axios.create(
    {
        baseURL: "http://localhost:3000",
    }
);

//Booking APIs
export const getAllBookings = () => API.get("/booking");

export const createBooking = (data) => API.post("/booking", data);

export const deleteBooking = (id) => API.delete(`/booking/${id}`);

export const updateBooking = (id, data) => API.put(`/booking/${id}`, data);

export const updateBookingStatus = (id, booking_status) => API.patch(`/booking/${id}/status`, {booking_status});

//table charts
export const getBookingsPerMonth = () => API.get("/booking/per-month");

export const getMonthlyRevenue = () => API.get("/booking/revenue-per-month");

export const getTopRooms = () => API.get("/booking/top-rooms");



//Dashboard api
export const getDashboardStats = () => API.get("/dashboard/stats");


//Rooms API
export const getRooms = () => API.get("/rooms");

export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

export const addRooms = (data) => API.post("/rooms", data);

export const editRoom = (id, data) => API.patch(`/rooms/edit/${id}`, data);

export const autoCompletePastBookings = (data) => API.patch("/booking/auto-complete", data);

export const getAvailableRooms = (checkIn, checkOut) => 
    {return API.get("/rooms/available", 
        {params: {
      check_in: checkIn,
      check_out: checkOut
    }});}


//Guest API
export const getAllGuest = () => API.get("/guests");

export const createGuest = (data) => API.post("/guests", data);

export const updateGuest = (id, data) => API.patch(`/guests/${id}`, data);

export const deleteGuest = (id) => API.delete(`/guests/${id}`);


//services API
export const getAllServices = () => API.get("/services");

export const getServiceByID = (id) => API.get(`/services/${id}`);

export const addService = (data) => API.post("/services", data);

export const deleteService = (id) => API.delete(`/services/${id}`);

export const editService = (id, data) => API.patch(`/services/edit/${id}`, data);


//invoices API
export const getAllInvoices = () => API.get("/invoices");

export const getInvoiceById = (id) => API.get(`/invoices/${id}`);

export const createInvoice = (data) => API.post("/invoices", data);

export const updateInvoiceStatus = (id, data) => API.patch(`/invoices/${id}/status`, data);

export const voidInvoice = (id, data) => API.patch(`/invoices/${id}/void`, data);

export const deleteInvoice = (id) => API.delete(`/invoices/${id}`);


//payments API
export const getAllPayments = () => API.get("/payments");

export const getPaymentById = (id) => API.get(`/payments/${id}`);

export const createPayment = (data) => API.post("/payments", data);

export const updatePaymentStatus = (id, data) => API.patch(`/payments/${id}/status`, data);

//export const voidPayment = (id, data) => API.patch(`/payments/${id}/void`, data);

export const deletePayment = (id) => API.delete(`/payments/${id}`);





export default API