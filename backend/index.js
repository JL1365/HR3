import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

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
import auditRoute from './routes/auditRoute.js';

dotenv.config();
connectDB();

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
const ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    "https://hr3.jjm-manufacturing.com",
    "https://hr3-jjm-manufacturing-8lav.onrender.com",
    "https://hr3-2htq.onrender.com"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With", 
        "Accept", 
        "x-client-key", 
        "x-client-token", 
        "x-client-secret", 
        "Origin", 
        "Host"
    ],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.vary('Origin');
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});


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

app.use("/api/audit",auditRoute);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});


app.listen(PORT,() => {
    console.log(`Server is running at PORT: ${PORT}`);
});