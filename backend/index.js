import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

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

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

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

app.listen(PORT,() => {
    console.log(`Server is running at PORT: ${PORT}`);
});