import express from 'express'
import { verifyToken } from '../middlewares/verifyToken.js';
import { addUserDeduction, getAllBenefitDeductions, getMyDeduction, getTotalDeductions, updateUserDeduction } from '../controllers/benefitDeductionController.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",verifyToken,addUserDeduction)
benefitDeductionRoute.get("/get-all-deductions",getAllBenefitDeductions)
benefitDeductionRoute.get("/get-total-deductions",getTotalDeductions)
benefitDeductionRoute.put("/update-user-deduction/:id",verifyToken,updateUserDeduction)

benefitDeductionRoute.get("/get-my-deductions",verifyToken,getMyDeduction)

export default benefitDeductionRoute;