import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:7687/api" 
    : "http://backend-hr3.jjm-manufacturing.com/api",
  timeout: import.meta.env.MODE === "development" ? 5000 : 10000,
  withCredentials: true,
});
