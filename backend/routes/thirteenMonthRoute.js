import express from 'express'
import { calculate13MonthPay } from '../controllers/thirteenMonthController.js';

const thirteenMonthRoute= express.Router();

thirteenMonthRoute.get("/calculate-13-month",calculate13MonthPay)

export default thirteenMonthRoute;