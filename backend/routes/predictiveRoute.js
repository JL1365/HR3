import express from 'express';
import { predictEmployeeBehavior, predictIncentiveEligibility } from '../controllers/predictiveController.js';

const predictiveRoute = express.Router();

predictiveRoute.get('/employee-behavior', predictEmployeeBehavior);
predictiveRoute.get('/incentive-eligibility', predictIncentiveEligibility);

export default predictiveRoute;
