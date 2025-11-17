import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://localhost:8090/api",
});

export const getAvailability = (date: string) =>
  api.get("/availability", { params: { date } });

export const postBooking = (payload: any) => api.post("/book", payload);

export const getBookings = (token: string) =>
  api.get("/bookings", { headers: { Authorization: `Bearer ${token}` } });

export const postBlock = (token: string, payload: any) =>
  api.post("/admin/block", payload, { headers: { Authorization: `Bearer ${token}` } });

export default api;
