import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useThirteenMonthStore = create((set) => ({
  thirteenMonthData: [],
  error: null,
  fetchThirteenMonthData: async () => {
    try {
      const response = await axiosInstance.get("thirteenMonth/calculate-13-month");
      set({ thirteenMonthData: response.data.data, error: null });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch data" });
    }
  },
  clearError: () => set({ error: null }),
}));