import express from 'express';
import { predictEmployeeBehavior, predictIncentiveEligibility, predictEmployeeRetention } from '../controllers/predictiveController.js';

const predictiveRoute = express.Router();

predictiveRoute.get('/employee-behavior', predictEmployeeBehavior);
predictiveRoute.get('/incentive-eligibility', predictIncentiveEligibility);
predictiveRoute.get('/employee-retention', predictEmployeeRetention);

export default predictiveRoute;
