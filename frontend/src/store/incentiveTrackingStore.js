import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useIncentiveTrackingStore = create((set, get) => ({
  incentiveTrackings: [],
  users: [],
  incentives: [],
  myIncentives: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,

  fetchIncentiveTrackings: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/incentiveTracking/get-all-incentive-tracking");
      set({ incentiveTrackings: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMyIncentives: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/incentiveTracking/get-my-incentives-tracking", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true,
      });
      set({ myIncentives: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createIncentiveTracking: async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post("/incentiveTracking/create-incentive-tracking", formData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true,
      });
      get().fetchIncentiveTrackings();
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateIncentiveTracking: async (id, formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(`/incentiveTracking/update-incentive-tracking/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true,
      });
      get().fetchIncentiveTrackings();
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteIncentiveTracking: async (id) => {
    try {
      await axiosInstance.delete(`/incentiveTracking/delete-incentive-tracking/${id}`);
      get().fetchIncentiveTrackings();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  handlePageChange: (pageNumber) => set({ currentPage: pageNumber }),

  formatDate: (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}));