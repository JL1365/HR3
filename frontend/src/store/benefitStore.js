import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useBenefitStore = create((set, get) => ({
  allBenefitRequests: [],
  allBenefitDeductions: [],
  uploadedDocuments: [],
  loading: false,
  error: null,
  uploadSuccess: null,

  fetchAllEmployeeBenefitDetails: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/benefit/get-all-employee-benefit-details");

      const { benefitRequests, benefitDeductions } = response.data;

      set({
        allBenefitRequests: benefitRequests || [],
        allBenefitDeductions: benefitDeductions || [],
        loading: false
      });
    } catch (error) {
      console.error("Error fetching benefit details:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch benefit details",
        loading: false
      });
    }
  },

  fetchUploadedDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/benefit/get-uploaded-documents");
      set({ uploadedDocuments: response.data.documents || [], loading: false });
    } catch (error) {
      console.error("Error fetching documents:", error);
      set({
        error: "Failed to fetch documents.",
        loading: false,
      });
    }
  },

  uploadBenefitDocument: async (formDataObj) => {
    set({ loading: true, error: null, uploadSuccess: null });
    try {
      await axiosInstance.post("/benefit/send-benefit-documents", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ uploadSuccess: "Document sent successfully!" });
      const refresh = await axiosInstance.get("/benefit/get-uploaded-documents");
      set({ uploadedDocuments: refresh.data.documents || [], loading: false });
    } catch (error) {
      console.error("Upload failed:", error);
      set({
        error: error.response?.data?.message || "Something went wrong",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
  clearUploadSuccess: () => set({ uploadSuccess: null }),
}));