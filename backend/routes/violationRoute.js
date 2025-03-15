import express from "express";
import { createEmployeeViolation, deleteViolation, getMyViolations, getEmployeeViolations, updateViolationStatus } from "../controllers/violationController.js";

const violationRoute = express.Router();

violationRoute.post("/create-employee-violation",createEmployeeViolation);
violationRoute.get("/get-all-employee-violations", getEmployeeViolations);
violationRoute.put("/update-violation-status/:id",updateViolationStatus);
violationRoute.delete("/delete-violation/:id",deleteViolation);
//NOT YET USE
violationRoute.get("/get-my-violations",getMyViolations);

export default violationRoute;
