import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './configs/db.js';

import authRoute from './routes/authRoute.js';
import compensationPlanningRoute from './routes/compensationPlanningRoute.js';
import compensationBenefitRoute from './routes/compensationBenefitRoute.js';
import penaltyRoute from './routes/penaltyRoute.js';

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

app.listen(PORT,() => {
    console.log(`Server is running at PORT: ${PORT}`);
});