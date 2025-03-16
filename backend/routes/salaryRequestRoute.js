import express from 'express';

import { addEmployeeCompensation, calculateGrossSalary, calculateNetSalary, finalizePayroll, getAllPayrollHistory } from '../controllers/salaryRequestController.js';

const salaryRequestRoute = express.Router();

salaryRequestRoute.get("/calculate-gross-salary", calculateGrossSalary);
salaryRequestRoute.get("/calculate-net-salary", calculateNetSalary);
salaryRequestRoute.post("/add-employee-compensation", addEmployeeCompensation);
salaryRequestRoute.post("/finalize-payroll", finalizePayroll);
salaryRequestRoute.get("/get-all-payroll-history", getAllPayrollHistory);

export default salaryRequestRoute;