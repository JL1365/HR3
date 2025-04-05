import express from 'express';
import { checkAuth, getAllUsers, adminLogin, employeeLogin, logoutAccount, getAllPositions, getAllLoginActivities, getPageVisits, getAllPageVisits, logPageVisit, getMyProfileInfo, toggleMultiFactor, verifyOTP, getMyMFAStatus } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { generateServiceToken } from '../middlewares/gatewayTokenGenerator.js';
import axios from 'axios'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs'

const authRoute = express();

authRoute.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

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

authRoute.post("/testLog-admin", async (req, res) => {

    try {
      const { email, password } = req.body;
      console.log(email)
      console.log(password)
      console.log("Login attempt for:", email);
  
      const serviceToken = generateServiceToken();
      console.log("Generated Service Token:", serviceToken);
  
      const response = await axios.get(
        "https://backend-hr1.jjm-manufacturing.com/api/admin/getData"
      );
  
      console.log("API Gateway Response:", response.data);
  
      const users = response.data;
  
      if (!users || users.length === 0) {
        console.log("No users found in the API Gateway response.");
        return res.status(400).json({ message: "No users found" });
      }
  
      const user = users.find((u) => u.email === email);
  
      if (!user) {
        console.log("User not found:", email);
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      console.log("User found:", { email: user.email, role: user.role }); 
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match status:", isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
        const token = generateTokenAndSetCookie(res, user);
      console.log("Generated Token:", token);
      return res.status(200).json({ token, user });
    } catch (err) {
      console.error("Error during login:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  });

authRoute.post("/testLog-employee", async (req, res) => {

    try {
      const { email, password } = req.body;
      console.log(email)
      console.log(password)
      console.log("Login attempt for:", email);
  
      const serviceToken = generateServiceToken();
      console.log("Generated Service Token:", serviceToken);
  
      const response = await axios.get(
        "https://backend-hr1.jjm-manufacturing.com/api/login-admin/employee-data"
      );
  
      console.log("API Gateway Response:", response.data);
  
      const users = response.data;
  
      if (!users || users.length === 0) {
        console.log("No users found in the API Gateway response.");
        return res.status(400).json({ message: "No users found" });
      }
  
      const user = users.find((u) => u.email === email);
  
      if (!user) {
        console.log("User not found:", email);
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      console.log("User found:", { email: user.email, role: user.role }); 
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match status:", isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
        const token = generateTokenAndSetCookie(res, user);
      console.log("Generated Token:", token);
      return res.status(200).json({ token, user });
    } catch (err) {
      console.error("Error during login:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  });
export default authRoute;