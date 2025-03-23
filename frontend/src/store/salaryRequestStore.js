import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useSalaryRequestStore = create((set) => ({
  grossSalaryData: null,
  netSalaryData: null,
  error: null,
  payrollHistory: null, // Add payrollHistory state

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

  finalizePayroll: async (batchId) => {
    try {
      const response = await axiosInstance.post("/salaryRequest/finalize-payroll", { batch_id: batchId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  fetchAllPayrollHistory: async () => { // Add fetchAllPayrollHistory method
    try {
      const response = await axiosInstance.get("/salaryRequest/get-all-payroll-history");
      set({ payrollHistory: response.data, error: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));