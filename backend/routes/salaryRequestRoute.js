import express from 'express';

import { calculateGrossSalary } from '../controllers/salaryRequestController.js';

const salaryRequestRoute = express.Router();

salaryRequestRoute.get("/calculate-gross-salary", calculateGrossSalary);

export default salaryRequestRoute;