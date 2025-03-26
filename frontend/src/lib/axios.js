import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:7687/api"
      : import.meta.env.VITE_ENV === "render"
        ? "https://hr3-2htq.onrender.com/api"
        : "https://backend-hr3.jjm-manufacturing.com/api",
  withCredentials: true,
});
