import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io'; 

import { connectDB } from './configs/db.js';

import authRoute from './routes/authRoute.js';
import compensationPlanningRoute from './routes/compensationPlanningRoute.js';
import compensationBenefitRoute from './routes/compensationBenefitRoute.js';
import penaltyRoute from './routes/penaltyRoute.js';
import violationRoute from './routes/violationRoute.js';

import incentiveRoute from './routes/incentiveRoute.js';
import incentiveTrackingRoute from './routes/incentiveTrackingRoute.js';

import benefitRoute from './routes/benefitRoute.js';
import benefitRequestRoute from './routes/benefitRequestRoute.js';
import benefitDeductionRoute from './routes/benefitDeductionRoute.js';

import attendanceRoute from './routes/attendanceRoute.js';
import salaryRequestRoute from './routes/salaryRequestRoute.js';
import integrationRoute from './routes/integrationRoute.js';
import adminDashboardRoute from './routes/adminDashboardRoute.js';
import employeeDasboardRoute from './routes/employeeDashboardRoute.js';
import predictiveRoute from './routes/predictiveRoute.js';
import auditRoute from './routes/auditRoute.js';
import notificationRoute from './routes/notificationRoute.js';

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" 
            ? "https://hr3-jjm-manufacturing-1p4f.onrender.com" 
            : "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://hr3.jjm-manufacturing.com",
        "https://hr3-jjm-manufacturing-8lav.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
}));

app.use("/api/auth",authRoute)
app.use("/api/compensation",compensationPlanningRoute)
app.use("/api/compensationBenefit",compensationBenefitRoute)
app.use("/api/penalty",penaltyRoute)
app.use("/api/violation",violationRoute)
app.use("/api/benefit",benefitRoute)
app.use("/api/benefitRequest",benefitRequestRoute);
app.use("/api/benefitDeduction",benefitDeductionRoute);

app.use("/api/incentive",incentiveRoute)
app.use("/api/incentiveTracking",incentiveTrackingRoute);

app.use("/api/attendance",attendanceRoute);
app.use("/api/salaryRequest",salaryRequestRoute);

app.use("/api/integration",integrationRoute);

app.use("/api/adminDashboard",adminDashboardRoute);
app.use("/api/employeeDashboard",employeeDasboardRoute);

app.use("/api/predictive",predictiveRoute);

app.use("/api/audit",auditRoute);

app.use("/api/notification",notificationRoute);


io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
    });
});

export { io };

server.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
});