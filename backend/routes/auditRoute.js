import express from 'express';
import { getAllAudits, createAudit, getMyRequest } from '../controllers/auditController.js';

const auditRoute = express.Router();

auditRoute.get("/get-all-audits", getAllAudits);

auditRoute.post("/create-audit", createAudit);
auditRoute.get("/get-my-request", getMyRequest);

export default auditRoute;