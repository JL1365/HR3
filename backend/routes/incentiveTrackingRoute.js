import express from "express";
import { createIncentiveTracking, deleteIncentiveTracking, getAllIncentiveTracking, getMyIncentiveTracking, updateIncentiveTracking } from "../controllers/incentiveTrackingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { roleValidation } from "../middlewares/roleValidation.js";

const incentiveTrackingRoute = express.Router();

incentiveTrackingRoute.post("/create-incentive-tracking",verifyToken, createIncentiveTracking);
incentiveTrackingRoute.get("/get-all-incentive-tracking", getAllIncentiveTracking);
incentiveTrackingRoute.put("/update-incentive-tracking/:id",verifyToken,roleValidation(["Superadmin"]), updateIncentiveTracking);
incentiveTrackingRoute.delete("/delete-incentive-tracking/:id",verifyToken,roleValidation(["Superadmin"]), deleteIncentiveTracking);

incentiveTrackingRoute.get("/get-my-incentives-tracking", verifyToken, getMyIncentiveTracking);

export default incentiveTrackingRoute;
