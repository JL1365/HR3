import {create} from 'zustand'
import { axiosInstance } from "../lib/axios.js";


export const useAuthStore  = create ((set) => ({
    user:null,
    token:null,
    isAuthenticated:false,

    adminLogin: async ({ email, password }) => {
        try {
            console.log("Login payload:", { email, password });
            const response = await axiosInstance.post("/auth/admin-login", { email, password });
            const { user, token } = response.data;

            set({ user, token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    },

    employeeLogin: async ({ email, password }) => {
        try {
            console.log("Login payload:", { email, password });
            const response = await axiosInstance.post("/auth/employee-login", { email, password });
            const { user, token } = response.data;

            set({ user, token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    },
}));