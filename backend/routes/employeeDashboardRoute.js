import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { 
    getMyAppliedRequestCount, 
    getMyTotalIncentivesGiven, 
    getMyLeavesCount, 
    getMyTotalSalary, 
    getMyTotalDeduction,
} from "../controllers/employeeDashboardController.js";

const employeeDashboardRoute = express.Router();

employeeDashboardRoute.get("/get-my-applied-request-count", verifyToken, getMyAppliedRequestCount);
employeeDashboardRoute.get("/get-my-total-deductions", verifyToken, getMyTotalDeduction);
employeeDashboardRoute.get("/get-my-total-incentives-given", verifyToken, getMyTotalIncentivesGiven);
employeeDashboardRoute.get("/get-my-leaves-count", verifyToken, getMyLeavesCount);
employeeDashboardRoute.get("/get-my-total-salary", verifyToken, getMyTotalSalary);

export default employeeDashboardRoute;