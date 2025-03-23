import {create} from 'zustand'
import { axiosInstance } from "../lib/axios.js";

export const useIntegrationStore  = create ((set) => ({
  budgetRequests: [],
  loading: false,
  error: null,
  fetchBudgetRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`integration/get-request-budget`);
      set({ budgetRequests: response.data });
    } catch (error) {
      set({ error: "Failed to fetch budget requests." });
    } finally {
      set({ loading: false });
    }
  },
  submitBudgetRequest: async (formDataObj, token) => {
    try {
      await axiosInstance.post(`integration/request-budget`, formDataObj, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Something went wrong" };
    }
  }
}));