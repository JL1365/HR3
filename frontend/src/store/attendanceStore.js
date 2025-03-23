import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useAttendanceStore = create((set) => ({
  attendanceData: [],
  leaveData: [],
  error: null,

  fetchAttendanceData: async () => {
    try {
      const response = await axiosInstance.get('/attendance/get-attendance-from-hr1');
      set({ attendanceData: response.data.attendanceData });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      set({ error: 'Error fetching attendance data' });
    }
  },

  fetchLeaveData: async () => {
    try {
      const response = await axiosInstance.get('/attendance/get-leaves-from-hr1');
      set({ leaveData: response.data.leaves });
    } catch (error) {
      console.error('Error fetching leave data:', error);
      set({ error: 'Error fetching leave data' });
    }
  },

  clearError: () => set({ error: null }),
}));