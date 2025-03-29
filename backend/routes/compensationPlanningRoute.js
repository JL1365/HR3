import express from 'express';
import { createCompensationPlan, getAllGrievance, getCompensationPlan, updateCompensationPlan, getMySalaryStructure, getGrievances } from '../controllers/compensationPlanningController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { roleValidation } from '../middlewares/roleValidation.js';

const compensationPlanningRoute = express.Router();

compensationPlanningRoute.post("/create-compensation-plan",createCompensationPlan);
compensationPlanningRoute.get("/get-compensation-plans",getCompensationPlan);
compensationPlanningRoute.put("/update-compensation-plan/:id",verifyToken,roleValidation(["Superadmin"]),updateCompensationPlan);

compensationPlanningRoute.get("/get-all-grievance",getAllGrievance);
compensationPlanningRoute.get("/get-grievances", getGrievances);

compensationPlanningRoute.get("/get-my-salary-structure",verifyToken,getMySalaryStructure);

export default compensationPlanningRoute;