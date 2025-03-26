import express from "express";

import { getAllUserCount, getAllAppliedRequestCount, getTotalDeductions, getTotalIncentivesGiven, getEmployeeIncentiveCount, getEmployeeLeaveCount, getEmployeeSalary } from "../controllers/adminDashboardController.js";

const adminDashboardRoute = express.Router();

adminDashboardRoute.get("/get-all-user-count",getAllUserCount);
adminDashboardRoute.get("/get-all-applied-request-count",getAllAppliedRequestCount);
adminDashboardRoute.get("/get-total-deductions",getTotalDeductions);
adminDashboardRoute.get("/get-employee-incentives-count",getEmployeeIncentiveCount);
adminDashboardRoute.get("/get-total-incentives-given",getTotalIncentivesGiven);
adminDashboardRoute.get("/get-employee-leaves-count",getEmployeeLeaveCount);
adminDashboardRoute.get("/get-employee-salary", getEmployeeSalary);

export default adminDashboardRoute;