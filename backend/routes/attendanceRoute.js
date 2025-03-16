import express from 'express';

import { getAttendanceFromHr1, getLeavesAndAttendance, getLeavesFromHr1 } from '../controllers/attendanceController.js';

const attendanceRoute = express.Router();

attendanceRoute.get("/get-leaves-from-hr1",getLeavesFromHr1);
attendanceRoute.get("/get-attendance-from-hr1",getAttendanceFromHr1);
attendanceRoute.get("/get-leaves-attendance-from-hr1",getLeavesAndAttendance);

export default attendanceRoute;