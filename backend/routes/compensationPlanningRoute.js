import express from 'express';


import { createCompensationPlan, getCompensationPlan } from '../controllers/compensationPlanningController.js';

const compensationPlanningRoute = express.Router();

compensationPlanningRoute.post("/create-compensation-plan",createCompensationPlan);
compensationPlanningRoute.get("/get-compensation-plans",getCompensationPlan);

export default compensationPlanningRoute;