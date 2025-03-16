import express from 'express';

import { addEmployeeCompensation, calculateGrossSalary, calculateNetSalary, finalizePayroll } from '../controllers/salaryRequestController.js';

const salaryRequestRoute = express.Router();

salaryRequestRoute.get("/calculate-gross-salary", calculateGrossSalary);
salaryRequestRoute.get("/calculate-net-salary", calculateNetSalary);
salaryRequestRoute.post("/add-employee-compensation", addEmployeeCompensation);
salaryRequestRoute.post("/finalize-payroll", finalizePayroll);

export default salaryRequestRoute;