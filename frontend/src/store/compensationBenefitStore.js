import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useCompensationBenefitStore = create((set) => ({
    benefits: [],
    error: null,
    loading: false,

    fetchBenefits: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/compensationBenefit/get-compensation-benefit-plans");
            set({ benefits: response.data.data || [], loading: false });
        } catch (error) {
            console.error("Error fetching compensation benefit plans:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch compensation benefit plans", 
                loading: false 
            });
        }
    },

    createCompensationBenefitPlan: async (planData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/compensationBenefit/create-compensation-benefit-plan", planData);
            set((state) => ({
                benefits: [...state.benefits, response.data.data],
                loading: false,
            }));
            return response.data;
        } catch (error) {
            console.error("Error creating compensation benefit plan:", error);
            set({ 
                error: error.response?.data?.message || "Failed to create compensation benefit plan", 
                loading: false 
            });
            throw error;
        }
    },

    updateCompensationBenefitPlan: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.put(`/compensationBenefit/update-compensation-benefit-plan/${id}`, updatedData);
            
            if (response.data && response.data.data) {
                set((state) => ({
                    benefits: state.benefits.map(plan => 
                        plan._id === id ? response.data.data : plan
                    ),
                    loading: false,
                }));
            } else {
                await set.fetchBenefits();
            }
            
            return response.data;
        } catch (error) {
            console.error("Error updating compensation plan:", error);
            set({ 
                error: error.response?.data?.message || "Failed to update compensation plan", 
                loading: false 
            });
            throw error;
        }
    },

    deleteCompensationBenefit: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.delete(`/compensationBenefit/delete-compensation-benefit-plan/${id}`);
            if (response.data.message === "Benefit deleted successfully") {
                set((state) => ({
                    benefits: state.benefits.filter((plan) => plan._id !== id),
                    loading: false,
                }));
            } else {
                set({
                    error: response.data.message || "Failed to delete compensation benefit",
                    loading: false,
                });
            }
            return response.data;
        } catch (error) {
            console.error("Error deleting compensation benefit plan:", error);
            set({
                error: error.response?.data?.message || "Failed to delete compensation benefit",
                loading: false,
            });
            throw error;
        }
    },
    

    clearError: () => set({ error: null }),
}));