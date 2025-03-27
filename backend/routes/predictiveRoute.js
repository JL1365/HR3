import express from 'express';
import { 
  predictEmployeeBehavior, 
  predictIncentiveEligibility, 
  predictViolations 
} from '../controllers/predictiveController.js';

const predictiveRoute = express.Router();

predictiveRoute.get('/employee-behavior', predictEmployeeBehavior);
predictiveRoute.get('/incentive-eligibility', predictIncentiveEligibility);
predictiveRoute.get('/violations', predictViolations);

export default predictiveRoute;