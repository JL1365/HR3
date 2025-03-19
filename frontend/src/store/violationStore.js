import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useViolationStore = create((set, get) => ({
  // State
  violations: [],
  myViolations: [],
  isLoading: false,
  error: null,
  
  // Actions
  createViolation: async (violationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        '/violation/create-employee-violation', 
        violationData
      );
      
      // Update violations list after creating a new one
      const violations = get().violations;
      set({ 
        violations: [...violations, response.data.violation],
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error creating violation' 
      });
      throw error;
    }
  },
  
  getViolations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/violation/get-all-employee-violations');
      set({ 
        violations: response.data.employeeViolations, 
        isLoading: false 
      });
      return response.data.employeeViolations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error fetching violations' 
      });
      throw error;
    }
  },
  
  getMyViolations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/violation/get-my-violations');
      set({ 
        myViolations: response.data.myViolations, 
        isLoading: false 
      });
      return response.data.myViolations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error fetching your violations' 
      });
      throw error;
    }
  },
  
  updateViolationStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/violation/update-violation-status/${id}`, 
        { status }
      );
      
      // Update the violations in the store
      const violations = get().violations.map(violation => 
        violation._id === id ? { ...violation, status } : violation
      );
      
      // Also update myViolations if needed
      const myViolations = get().myViolations.map(violation => 
        violation._id === id ? { ...violation, status } : violation
      );
      
      set({ violations, myViolations, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error updating violation status' 
      });
      throw error;
    }
  },
  
  deleteViolation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/violation/delete-violation/${id}`);
      
      // Remove the deleted violation from the store
      const violations = get().violations.filter(
        violation => violation._id !== id
      );
      
      // Also remove from myViolations if present
      const myViolations = get().myViolations.filter(
        violation => violation._id !== id
      );
      
      set({ violations, myViolations, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Error deleting violation' 
      });
      throw error;
    }
  },
  
  clearErrors: () => set({ error: null })
}));