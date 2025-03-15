import express from "express";
import { createEmployeeViolation, deleteViolation, getMyViolations, getEmployeeViolations, updateViolationStatus } from "../controllers/violationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const violationRoute = express.Router();

violationRoute.post("/create-employee-violation",createEmployeeViolation);
violationRoute.get("/get-all-employee-violations", getEmployeeViolations);
violationRoute.put("/update-violation-status/:id",updateViolationStatus);
violationRoute.delete("/delete-violation/:id",deleteViolation);

violationRoute.get("/get-my-violations",verifyToken,getMyViolations);

export default violationRoute;
