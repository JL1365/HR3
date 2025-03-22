import {create} from 'zustand'
import { axiosInstance } from "../lib/axios.js";


export const useAuthStore  = create ((set) => ({
    user:null,
    users:[],
    token:null,
    isAuthenticated:false,
    allPositions:[],

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
    
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check-auth");
            console.log("User from API:", response.data);
            if (response.data.user) {
                set({ user: response.data.user, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch (error) {
            console.error("User not authenticated:", error);
            set({ user: null, isAuthenticated: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ user: null, token: null, isAuthenticated: false });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },
    
    fetchAllPositions: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/auth/get-all-positions");
            set({ allPositions: response.data.positions, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch positions", loading: false });
        }
    },

    fetchAllUsers: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/auth/get-all-users");
            set({ users: response.data.users, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch users", loading: false });
        }
    },
}));