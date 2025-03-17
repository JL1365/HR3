import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:7687/api" 
    : "http://backend-hr3.jjm-manufacturing.com/api",
  withCredentials: true,
});
