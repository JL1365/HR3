import express from 'express';

import { checkAuth, getAllUsers, login, logoutAccount } from '../controllers/authController.js';

import { verifyToken } from '../middlewares/verifyToken.js';

const authRoute = express();

authRoute.get("/get-all-users",getAllUsers);
authRoute.post("/login",login);
authRoute.get("/check-auth",verifyToken,checkAuth);
authRoute.post("/logout",logoutAccount);

export default authRoute;