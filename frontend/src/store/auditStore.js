import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useAuditStore = create((set) => ({
  audits: [],
  error: null,
  loading: false,

  fetchAudits: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/audit/get-all-audits');
      set({ audits: response.data.auditData, loading: false });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        set({ audits: [], loading: false });
      } else {
        set({ error: error.message, loading: false });
      }
    }
  },

  createAudit: async (auditData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/audit/create-audit', auditData);
      set((state) => ({
        audits: [...state.audits, response.data.createdAudit],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMyRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/audit/get-my-request');
      set({ myRequests: response.data.audits, loading: false });
      return response.data.audits;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));