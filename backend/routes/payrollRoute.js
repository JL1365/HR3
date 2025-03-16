import express from 'express';

import { getAttendanceFromHr1, getLeavesAndAttendance, getLeavesFromHr1 } from '../controllers/payrollController.js';

const payrollRoute = express.Router();

payrollRoute.get("/get-leaves-from-hr1",getLeavesFromHr1);
payrollRoute.get("/get-attendance-from-hr1",getAttendanceFromHr1);
payrollRoute.get("/get-leaves-attendance-from-hr1",getLeavesAndAttendance);

export default payrollRoute;