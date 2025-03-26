import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";

export const useAdminDashboard = create((set) => ({
  userCount: 0,
  appliedRequestCount: 0,
  totalDeductions: 0,
  totalIncentivesGiven: 0,
  employeeIncentiveCount: 0,
  employeeLeaveCount: 0,
  totalSalary: 0,
  error: null,

  fetchDashboardData: async () => {
    try {
      const [
        userCountRes,
        appliedRequestCountRes,
        totalDeductionsRes,
        totalIncentivesGivenRes,
        employeeIncentiveCountRes,
        employeeLeaveCountRes,
        totalSalaryRes
      ] = await Promise.all([
        axiosInstance.get('/adminDashboard/get-all-user-count'),
        axiosInstance.get('/adminDashboard/get-all-applied-request-count'),
        axiosInstance.get('/adminDashboard/get-total-deductions'),
        axiosInstance.get('/adminDashboard/get-total-incentives-given'),
        axiosInstance.get('/adminDashboard/get-employee-incentives-count'),
        axiosInstance.get('/adminDashboard/get-employee-leaves-count'),
        axiosInstance.get('/adminDashboard/get-employee-salary')
      ]);

      set({
        userCount: userCountRes.data.count,
        appliedRequestCount: appliedRequestCountRes.data.totalAppliedRequests,
        totalDeductions: totalDeductionsRes.data.totalDeductions,
        totalIncentivesGiven: totalIncentivesGivenRes.data.totalIncentivesGiven,
        employeeIncentiveCount: employeeIncentiveCountRes.data.totalEmployeesGivenIncentives,
        employeeLeaveCount: employeeLeaveCountRes.data.employeeWithLeaves,
        totalSalary: totalSalaryRes.data.totalSalary,
        error: null
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));