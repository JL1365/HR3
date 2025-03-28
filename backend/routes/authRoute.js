import express from 'express';
import { checkAuth, getAllUsers, adminLogin, employeeLogin, logoutAccount, getAllPositions, getAllLoginActivities, getPageVisits, getAllPageVisits, logPageVisit, getMyProfileInfo, toggleMultiFactor, verifyOTP, getMyMFAStatus } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const authRoute = express();

authRoute.get("/get-all-users", getAllUsers);
authRoute.post("/admin-login", adminLogin);
authRoute.post("/employee-login", employeeLogin);
authRoute.get("/check-auth", verifyToken, checkAuth);
authRoute.post("/logout", logoutAccount);
authRoute.get("/get-all-positions", verifyToken, getAllPositions);
authRoute.get("/get-login-activities", getAllLoginActivities);
authRoute.post("/log-page-visit",verifyToken ,logPageVisit);
authRoute.get("/get-page-visits", getPageVisits);
authRoute.get("/get-all-page-visits", getAllPageVisits);
authRoute.get("/get-my-profile-info",verifyToken, getMyProfileInfo);
authRoute.post("/toggle-mfa", verifyToken, toggleMultiFactor);
authRoute.get("/get-my-mfa-status", verifyToken, getMyMFAStatus);
authRoute.post("/verify-otp", verifyOTP);

export default authRoute;