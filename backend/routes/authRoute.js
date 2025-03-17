import express from 'express';
import { checkAuth, getAllUsers, adminLogin, employeeLogin, logoutAccount, getAllPositions } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const authRoute = express();

authRoute.get("/get-all-users", getAllUsers);
authRoute.post("/admin-login", adminLogin);
authRoute.post("/employee-login", employeeLogin);
authRoute.get("/check-auth", verifyToken, checkAuth);
authRoute.post("/logout", logoutAccount);
authRoute.get("/get-all-positions", verifyToken, getAllPositions);

export default authRoute;