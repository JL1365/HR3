import express from "express";
import { createIncentiveTracking, deleteIncentiveTracking, getAllIncentiveTracking, updateIncentiveTracking } from "../controllers/incentiveTrackingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const incentiveTrackingRoute = express.Router();

incentiveTrackingRoute.post("/create-incentive-tracking",verifyToken, createIncentiveTracking);
incentiveTrackingRoute.get("/get-all-incentive-tracking", getAllIncentiveTracking);
incentiveTrackingRoute.put("/update-incentive-tracking/:id", updateIncentiveTracking);
incentiveTrackingRoute.delete("/delete-incentive-tracking/:id", deleteIncentiveTracking);

export default incentiveTrackingRoute;
