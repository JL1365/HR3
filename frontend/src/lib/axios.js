import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === "development" 
//     ? "http://localhost:7687/api" 
//     : "https://backend-hr3.jjm-manufacturing.com/api", 
//   withCredentials: true,
// });

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:7687/api" 
    : "https://hr3-jjm-manufacturing-8lav.onrender.com/api", 
  withCredentials: true,
});
