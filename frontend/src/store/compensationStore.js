import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useCompensationStore = create((set) => ({
    compensationPlans: [],
    error: null,
    loading: false,
    salaryStructure: null,
    grievances: [],

    fetchCompensationPlans: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/compensation/get-compensation-plans");
            set({ compensationPlans: response.data.data || [], loading: false });
        } catch (error) {
            console.error("Error fetching compensation plans:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch compensation plans", 
                loading: false 
            });
        }
    },

    createCompensationPlan: async (planData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/compensation/create-compensation-plan", planData);
            set((state) => ({
                compensationPlans: [...state.compensationPlans, response.data.data],
                loading: false,
            }));
            return response.data;
        } catch (error) {
            console.error("Error creating compensation plan:", error);
            set({ 
                error: error.response?.data?.message || "Failed to create compensation plan", 
                loading: false 
            });
            throw error;
        }
    },

    updateCompensationPlan: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.put(`/compensation/update-compensation-plan/${id}`, updatedData);
            
            if (response.data && response.data.data) {
                set((state) => ({
                    compensationPlans: state.compensationPlans.map(plan => 
                        plan._id === id ? response.data.data : plan
                    ),
                    loading: false,
                }));
            } else {
                await set.fetchCompensationPlans();
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

    fetchMySalaryStructure: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/compensation/get-my-salary-structure");
            set({ salaryStructure: response.data.data, loading: false });
        } catch (error) {
            console.error("Error fetching salary structure:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch salary structure", 
                loading: false 
            });
        }
    },

    fetchGrievances: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/compensation/get-grievances");
            set({ grievances: response.data.data || [], loading: false });
        } catch (error) {
            console.error("Error fetching grievances:", error);
            set({ 
                error: error.response?.data?.message || "Failed to fetch grievances", 
                loading: false 
            });
        }
    },

    clearError: () => set({ error: null }),
}));