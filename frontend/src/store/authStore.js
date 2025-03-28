import {create} from 'zustand'
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore  = create ((set) => ({
    user: null,
    users: [],
    token: null,
    isAuthenticated: false,
    allPositions: [],
    loginActivities: [], 

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
            const { user, token, mfaEnabled } = response.data;

            set({ user, token, isAuthenticated: !mfaEnabled });
            return { success: true, mfaEnabled };
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

    fetchLoginActivities: async () => {
        try {
            const response = await axiosInstance.get("/auth/get-login-activities");
            set({ loginActivities: response.data.data });
        } catch (error) {
            console.error("Error fetching login activities:", error);
        }
    },

    getMyProfileInfo: async () => {
        try {
            const response = await axiosInstance.get("/auth/get-my-profile-info");
            console.log("Profile Info Response:", response.data.user); // Debug log
            set({ user: response.data.user });
        } catch (error) {
            console.error("Detailed Error Fetching Profile:", error);
            console.error("Error Response:", error.response?.data);
            // Optionally set user to null or handle the error state
            set({ user: null });
        }
    },

    toggleMFA: async (enableMFA) => {
        try {
            const response = await axiosInstance.post("/auth/toggle-mfa", { enableMFA });
            set((state) => ({
                user: { ...state.user, multiFactorEnabled: enableMFA },
            }));
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Failed to toggle MFA:", error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || "Failed to toggle MFA" };
        }
    }
}));