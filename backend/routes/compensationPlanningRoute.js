import express from 'express';


import { createCompensationPlan, getAllGrievance, getCompensationPlan } from '../controllers/compensationPlanningController.js';

const compensationPlanningRoute = express.Router();

compensationPlanningRoute.post("/create-compensation-plan",createCompensationPlan);
compensationPlanningRoute.get("/get-compensation-plans",getCompensationPlan);

compensationPlanningRoute.get("/get-all-grievance",getAllGrievance);

export default compensationPlanningRoute;