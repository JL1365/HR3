import express from 'express';
import { getBudgetRequests, requestBudget, updateBudgetRequest } from '../controllers/integrationController.js';
import upload from '../configs/multerConfig.js';


const integrationRoute = express.Router();

integrationRoute.post("/request-budget" ,upload.single("documents"), requestBudget);
integrationRoute.get("/get-request-budget", getBudgetRequests);
integrationRoute.post("/updateStatusFinance", updateBudgetRequest);

export default integrationRoute;