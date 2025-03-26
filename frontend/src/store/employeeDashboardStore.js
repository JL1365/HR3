import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useEmployeeDashboard = create((set) => ({
  appliedRequestCount: 0,
  totalDeductions: 0,
  totalIncentivesGiven: 0,
  employeeLeaveCount: 0,
  totalSalary: 0,
  error: null,

  fetchDashboardData: async () => {
    try {
      const [
        appliedRequestCountRes,
        totalDeductionsRes,
        totalIncentivesGivenRes,
        employeeLeaveCountRes,
        totalSalaryRes
      ] = await Promise.all([
        axiosInstance.get('/employeeDashboard/get-my-applied-request-count'),
        axiosInstance.get('/employeeDashboard/get-my-total-deductions'),
        axiosInstance.get('/employeeDashboard/get-my-total-incentives-given'),
        axiosInstance.get('/employeeDashboard/get-my-leaves-count'),
        axiosInstance.get('/employeeDashboard/get-my-total-salary')
      ]);

      set({
        appliedRequestCount: appliedRequestCountRes.data.totalAppliedRequests,
        totalDeductions: totalDeductionsRes.data.totalAmount,
        totalIncentivesGiven: totalIncentivesGivenRes.data.totalIncentivesGiven,
        employeeLeaveCount: employeeLeaveCountRes.data.leavesCount,
        totalSalary: totalSalaryRes.data.totalSalary,
        error: null
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));