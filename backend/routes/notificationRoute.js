import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {  getNotificationsByRole } from "../controllers/notificationController.js";

const notificationRoute = express.Router();

notificationRoute.get("/get-notifications-by-role", verifyToken, getNotificationsByRole);
export default notificationRoute