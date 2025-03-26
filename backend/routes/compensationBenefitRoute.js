import express from 'express';

import { createBenefit, getAllBenefits, getBenefitById, updateBenefit, deleteBenefit, getEmployeeCompensation } from '../controllers/compensationBenefitController.js';

const compensationBenefitRoute = express.Router();

compensationBenefitRoute.post("/create-compensation-benefit-plan", createBenefit);
compensationBenefitRoute.get("/get-compensation-benefit-plans", getAllBenefits);
compensationBenefitRoute.get("/get-compensation-plan-by-id/:id", getBenefitById);
compensationBenefitRoute.put("/update-compensation-benefit-plan/:id", updateBenefit);
compensationBenefitRoute.delete("/delete-compensation-benefit-plan/:id", deleteBenefit);
compensationBenefitRoute.get("/get-employee-compensation", getEmployeeCompensation);

export default compensationBenefitRoute;