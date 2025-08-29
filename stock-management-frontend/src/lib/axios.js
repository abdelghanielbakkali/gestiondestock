import axios from "axios";

const api = axios.create({
  // Dev: VITE_API_URL=http://127.0.0.1:8000/api
  // Prod: VITE_API_URL=https://VOTRE-BACKEND.onrender.com/api
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;