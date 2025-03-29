import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io'; 
import csrfProtection from 'csurf';

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
import thirteenMonthRoute from './routes/thirteenMonthRoute.js';

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT;
const csrf = csrfProtection({ cookie: true });
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" 
            ? "https://hr3.jjm-manufacturing.com" 
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
    allowedHeaders: ["Content-Type", "Authorization","csrf-token"], 
}));

app.use("/api/auth",csrf,authRoute)
app.use("/api/compensation",csrf,compensationPlanningRoute)
app.use("/api/compensationBenefit",csrf,compensationBenefitRoute)
app.use("/api/penalty",csrf,penaltyRoute)
app.use("/api/violation",csrf,violationRoute)
app.use("/api/benefit",csrf,benefitRoute)
app.use("/api/benefitRequest",csrf,benefitRequestRoute);
app.use("/api/benefitDeduction",csrf,benefitDeductionRoute);

app.use("/api/incentive",csrf,incentiveRoute)
app.use("/api/incentiveTracking",csrf,incentiveTrackingRoute);

app.use("/api/attendance",csrf,attendanceRoute);
app.use("/api/salaryRequest",csrf,salaryRequestRoute);

app.use("/api/integration",csrf,integrationRoute);

app.use("/api/adminDashboard",csrf,adminDashboardRoute);
app.use("/api/employeeDashboard",csrf,employeeDasboardRoute);

app.use("/api/predictive",csrf,predictiveRoute);

app.use("/api/audit",csrf,auditRoute);

app.use("/api/notification",csrf,notificationRoute);

app.use("/api/thirteenMonth",csrf,thirteenMonthRoute);

app.use((req, res, next) => {
    if(req.method === "POST"){
        const csrfToken = req.headers['csrf-token'];
        if(!csrfToken || csrfToken !== req.csrfToken()){
            return res.status(403).json({success:false,message:'Invalid CSRF token'});
        }
    }
    next();
});

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
    });
});

export { io };

server.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
});