import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useSalaryRequestStore = create((set) => ({
  grossSalaryData: null,
  netSalaryData: null,
  error: null,

  fetchGrossSalary: async () => {
    try {
      const response = await axiosInstance.get("/salaryRequest/calculate-gross-salary");
      set({ grossSalaryData: response.data.data, error: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchNetSalary: async () => {
    try {
      const response = await axiosInstance.get("/salaryRequest/calculate-net-salary");
      set({ netSalaryData: response.data.data, error: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  addEmployeeCompensation: async (compensationData) => {
    try {
      const response = await axiosInstance.post("/salaryRequest/add-employee-compensation", compensationData);
      set({ error: null });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));