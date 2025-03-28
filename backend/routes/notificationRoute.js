import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getNotificationsByRole, markNotificationAsRead } from "../controllers/notificationController.js";

const notificationRoute = express.Router();

notificationRoute.get("/get-notifications-by-role", verifyToken, getNotificationsByRole);
notificationRoute.put("/mark-as-read/:id", verifyToken, markNotificationAsRead);

export default notificationRoute;