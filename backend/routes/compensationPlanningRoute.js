import express from 'express';


import { createCompensationPlan, getAllGrievance, getCompensationPlan, updateCompensationPlan } from '../controllers/compensationPlanningController.js';

const compensationPlanningRoute = express.Router();

compensationPlanningRoute.post("/create-compensation-plan",createCompensationPlan);
compensationPlanningRoute.get("/get-compensation-plans",getCompensationPlan);
compensationPlanningRoute.put("/update-compensation-plan/:id",updateCompensationPlan);

compensationPlanningRoute.get("/get-all-grievance",getAllGrievance);

export default compensationPlanningRoute;