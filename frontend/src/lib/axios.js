import axios from "axios";

const isDev = import.meta.env.MODE === "development";

const baseURL = isDev
  ? "http://localhost:7687/api"
  : window.location.hostname === "hr3.jjm-manufacturing.com"
    ? "https://backend-hr3.jjm-manufacturing.com/api"
    : "https://hr3-jjm-manufacturing-8lav.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
