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

axiosInstance.interceptors.request.use(async (config) => {
  if (!config.headers['csrf-token']) {
    const response = await axios.get(`${axiosInstance.defaults.baseURL}/auth/csrf-token`, {
      withCredentials: true,
    });
    config.headers['csrf-token'] = response.data.csrfToken;
  }
  return config;
});
