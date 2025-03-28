import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useBenefitDeductiontStore = create((set, get) => ({
    allDeductions: [],
    myDeductions: [],
    loading: false,
    error: null,
  
    fetchAllBenefitDeductions: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axiosInstance.get("/benefitDeduction/get-all-deductions");
        set({ allDeductions: response.data.deductions || [], loading: false });
      } catch (error) {
        console.error("Error fetching benefit deductions:", error);
        set({ 
          error: error.response?.data?.message || "Failed to fetch benefit deductions", 
          loading: false 
        });
      }
    },

    fetchMyDeductions: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axiosInstance.get("/benefitDeduction/get-my-deductions");
        set({ myDeductions: response.data.deductions || [], loading: false });
      } catch (error) {
        console.error("Error fetching my deductions:", error);
        set({ 
          error: error.response?.data?.message || "Failed to fetch my deductions", 
          loading: false 
        });
      }
    },

    addUserDeduction: async ({ userId, benefitRequestId, amount }) => {
        try {
          const response = await axiosInstance.post("/benefitDeduction/add-user-deduction", {
            userId,
            benefitRequestId,
            amount,
          });
      
          await get().fetchAllBenefitDeductions();
      
          return { success: true, message: response.data.message };
        } catch (error) {
          console.error("Error adding user deduction:", error);
          return {
            success: false,
            message: error.response?.data?.message || "Failed to add deduction",
          };
        }
      },

    updateUserDeduction: async ({ id, amount }) => {
        try {
            const response = await axiosInstance.put(`/benefitDeduction/update-user-deduction/${id}`, { amount });
            await get().fetchAllBenefitDeductions();
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Error updating user deduction:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update deduction",
            };
        }
    },
      
  
    clearError: () => set({ error: null }),
  }));
