import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useBenefitRequestStore = create((set, get) => ({
    allBenefitRequests: [],
    fetchAllBenefitRequest: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/benefitRequest/get-all-applied-requests");
            set({ allBenefitRequests: response.data.data || [], loading: false });
        } catch (error) {
            console.error("Error fetching  benefit request:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch  benefit requests", 
                loading: false 
            });
        }
    },

    updateBenefitRequestStatus: async (id, newStatus) => {
        try {
          await axiosInstance.put(`/benefitRequest/update-apply-request-status/${id}`, newStatus);
          get().fetchAllBenefitRequest(); 
        } catch (error) {
          set({ error: error.response?.data?.message || "Failed to update request status" });
        }
      },
    
    myApplyRequests: [],
    fetchMyApplyRequests: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/benefitRequest/get-my-apply-requests");
            set({ myApplyRequests: response.data.myApplyRequests || [], loading: false });
        } catch (error) {
            console.error("Error fetching my apply requests:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch my apply requests", 
                loading: false 
            });
        }
    },

    applyBenefit: async (formData) => {
        try {
            await axiosInstance.post("/benefitRequest/apply-benefit", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            get().fetchMyApplyRequests(); 
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to apply for benefit" });
        }
    },

    clearError: () => set({ error: null }),
}));