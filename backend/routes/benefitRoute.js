import express from 'express'

import {getUploadedDocuments, uploadDocument } from '../controllers/benefitController.js';

import upload from '../configs/multerConfig.js';

const benefitRoute = express.Router();

benefitRoute.post("/send-benefit-documents",upload.single('documentFile'),uploadDocument);
benefitRoute.get("/get-uploaded-documents", getUploadedDocuments);

export default benefitRoute;