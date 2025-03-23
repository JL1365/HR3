import express from 'express'

import {getAllEmployeeBenefitDetails, getUploadedDocuments, uploadDocument } from '../controllers/benefitController.js';

import upload from '../configs/multerConfig.js';

const benefitRoute = express.Router();


benefitRoute.get("/get-all-employee-benefit-details", getAllEmployeeBenefitDetails);
benefitRoute.post("/send-benefit-documents",upload.single('documentFile'),uploadDocument);
benefitRoute.get("/get-uploaded-documents", getUploadedDocuments);

export default benefitRoute;