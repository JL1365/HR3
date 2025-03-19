import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const usePenaltyStore = create((set, get) => ({
  allPenaltyLevels: [],
  loading: false,
  error: null,

  fetchAllPenaltyLevels: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/penalty/get-all-penalty-levels");
      set({ allPenaltyLevels: response.data.allPenaltyLevels, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch penalty levels", loading: false });
    }
  },

  createPenaltyLevel: async (penaltyData) => {
    try {
      await axiosInstance.post("/penalty/create-penalty-level", penaltyData);
      get().fetchAllPenaltyLevels();
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to create penalty level" });
    }
  },

  updatePenaltyLevel: async (id, penaltyData) => {
    try {
      await axiosInstance.put(`/penalty/update-penalty/${id}`, penaltyData);
      get().fetchAllPenaltyLevels(); 
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update penalty level" });
    }
  },

  deletePenaltyLevel: async (id) => {
    try {
      await axiosInstance.delete(`/penalty/delete-penalty/${id}`);
      get().fetchAllPenaltyLevels();
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to delete penalty level" });
    }
  }
}));
