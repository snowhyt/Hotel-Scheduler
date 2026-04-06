import axios from "axios";

const API = axios.create(
    {
        baseURL: "http://localhost:3000",
    }
);

//Booking APIs
export const getBookings = () => API.get("/booking");

export const createBooking = (data) => API.post("/booking", data);

export const deleteBooking = (id) => API.delete(`/booking/${id}`);

export const updateBookingStatus = (id, status) => API.patch(`/booking/${id}/status`, {status});

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

export default API