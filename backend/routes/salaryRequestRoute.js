import express from 'express';

import { addEmployeeCompensation, calculateGrossSalary, calculateNetSalary, finalizePayroll, getAllPayrollHistory, getMyCalculationGrossSalary, getMyCalculationNetSalary } from '../controllers/salaryRequestController.js';
import {verifyToken} from '../middlewares/verifyToken.js'

const salaryRequestRoute = express.Router();

salaryRequestRoute.get("/calculate-gross-salary", calculateGrossSalary);
salaryRequestRoute.get("/calculate-net-salary", calculateNetSalary);
salaryRequestRoute.post("/add-employee-compensation", addEmployeeCompensation);
salaryRequestRoute.post("/finalize-payroll", finalizePayroll);
salaryRequestRoute.get("/get-all-payroll-history", getAllPayrollHistory);

salaryRequestRoute.get("/get-my-calculate-gross-salary",verifyToken, getMyCalculationGrossSalary);
salaryRequestRoute.get("/get-my-calculate-net-salary",verifyToken, getMyCalculationNetSalary);

export default salaryRequestRoute;