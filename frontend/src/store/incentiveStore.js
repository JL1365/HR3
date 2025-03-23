import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useIncentiveStore = create((set, get) => ({
  allIncentives: [],
  loading: false,
  error: null,
  fetchAllIncentives: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/incentive/get-all-incentives");
      set({ allIncentives: response.data.allIncentives, loading: false });
    } catch (error) {
      console.error("Error fetching incentives:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch incentives",
        loading: false
      });
    }
  },
  createIncentive: async (incentiveData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/incentive/create-incentive", incentiveData);
      set((state) => ({
        allIncentives: [...state.allIncentives, response.data.newIncentive],
        loading: false
      }));
    } catch (error) {
      console.error("Error creating incentive:", error);
      set({
        error: error.response?.data?.message || "Failed to create incentive",
        loading: false
      });
    }
  },
  updateIncentive: async (id, incentiveData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/incentive/update-incentive/${id}`, incentiveData);
      set((state) => ({
        allIncentives: state.allIncentives.map((incentive) =>
          incentive._id === id ? response.data.updatedIncentive : incentive
        ),
        loading: false
      }));
    } catch (error) {
      console.error("Error updating incentive:", error);
      set({
        error: error.response?.data?.message || "Failed to update incentive",
        loading: false
      });
    }
  },
  deleteIncentive: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/incentive/delete-incentive/${id}`);
      set((state) => ({
        allIncentives: state.allIncentives.filter((incentive) => incentive._id !== id),
        loading: false
      }));
    } catch (error) {
      console.error("Error deleting incentive:", error);
      set({
        error: error.response?.data?.message || "Failed to delete incentive",
        loading: false
      });
    }
  },
  clearError: () => set({ error: null }),
}));