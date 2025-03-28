import express from 'express'
import { verifyToken } from '../middlewares/verifyToken.js';
import { addUserDeduction, getAllBenefitDeductions, getMyDeduction, getTotalDeductions, updateUserDeduction } from '../controllers/benefitDeductionController.js';
import { roleValidation } from '../middlewares/roleValidation.js';

const benefitDeductionRoute = express.Router();

benefitDeductionRoute.post("/add-user-deduction",addUserDeduction)
benefitDeductionRoute.get("/get-all-deductions",getAllBenefitDeductions)
benefitDeductionRoute.get("/get-total-deductions",getTotalDeductions)
benefitDeductionRoute.put("/update-user-deduction/:id",verifyToken,roleValidation(["Superadmin"]),updateUserDeduction)

benefitDeductionRoute.get("/get-my-deductions",verifyToken,getMyDeduction)

export default benefitDeductionRoute;