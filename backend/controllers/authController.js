import axios from 'axios';
import bcrypt from 'bcryptjs';
import useragent from 'useragent';
import { LoginActivity } from '../models/loginActivityModel.js';
import { generateServiceToken } from '../middlewares/gatewayTokenGenerator.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { PageVisit } from '../models/pageVisitModel.js';

export const getAllUsers = async (req, res) => {
    try {
        const serviceToken = generateServiceToken(); 

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data; 

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found!" });
        }

        return res.status(200).json({ message: "Fetching users successfully!", users });
    } catch (error) {
        console.error(`Error in getting users: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const serviceToken = generateServiceToken();
        const userAgent = useragent.parse(req.headers["user-agent"]);
        const ipAddress =
            process.env.NODE_ENV === "production"
                ? req.headers["x-forwarded-for"]?.split(",")[0] || "Unknown"
                : req.socket.remoteAddress || "Unknown";

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data;
        const user = users.find((u) => u.email === email && u.role === "Admin");

        if (!user) {
            await LoginActivity.create({
                email,
                loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Failed" }],
                failedLoginAttempts: 1,
                deviceInfo: userAgent.toString(),
            });

            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await LoginActivity.findOneAndUpdate(
                { user_id: user._id },
                { $inc: { failedLoginAttempts: 1 } },
                { upsert: true }
            );

            await LoginActivity.updateOne(
                { user_id: user._id },
                {
                    $push: {
                        loginHistory: {
                            ipAddress,
                            device: userAgent.toString(),
                            status: "Failed",
                        },
                    },
                }
            );

            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateTokenAndSetCookie(res, user);

        const loginRecord = await LoginActivity.findOne({ user_id: user._id });

        if (loginRecord) {
            loginRecord.loginCount += 1;
            loginRecord.lastLogin = new Date();
            loginRecord.failedLoginAttempts = 0;
            loginRecord.deviceInfo = userAgent.toString();
            loginRecord.loginHistory.push({
                ipAddress,
                device: userAgent.toString(),
                status: "Success",
            });
            await loginRecord.save();
        } else {
            await LoginActivity.create({
                user_id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                position: user.position,
                Hr: user.Hr,
                loginCount: 1,
                lastLogin: new Date(),
                failedLoginAttempts: 0,
                deviceInfo: userAgent.toString(),
                loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Success" }],
            });
        }

        return res.status(200).json({ token, user });
    } catch (error) {
        console.error("Error during admin login:", error.message);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

export const employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const serviceToken = generateServiceToken();
        const userAgent = useragent.parse(req.headers["user-agent"]);
        const ipAddress =
            process.env.NODE_ENV === "production"
                ? req.headers["x-forwarded-for"]?.split(",")[0] || "Unknown"
                : req.socket.remoteAddress || "Unknown";

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data;
        const user = users.find((u) => u.email === email && u.role === "Employee");

        if (!user) {
            await LoginActivity.create({
                email,
                loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Failed" }],
                failedLoginAttempts: 1,
                deviceInfo: userAgent.toString(),
            });

            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await LoginActivity.findOneAndUpdate(
                { user_id: user._id },
                { $inc: { failedLoginAttempts: 1 } },
                { upsert: true }
            );

            await LoginActivity.updateOne(
                { user_id: user._id },
                {
                    $push: {
                        loginHistory: {
                            ipAddress,
                            device: userAgent.toString(),
                            status: "Failed",
                        },
                    },
                }
            );

            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateTokenAndSetCookie(res, user);

        const loginRecord = await LoginActivity.findOne({ user_id: user._id });

        if (loginRecord) {
            loginRecord.loginCount += 1;
            loginRecord.lastLogin = new Date();
            loginRecord.failedLoginAttempts = 0;
            loginRecord.deviceInfo = userAgent.toString();
            loginRecord.loginHistory.push({
                ipAddress,
                device: userAgent.toString(),
                status: "Success",
            });
            await loginRecord.save();
        } else {
            await LoginActivity.create({
                user_id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                position: user.position,
                Hr: user.Hr,
                loginCount: 1,
                lastLogin: new Date(),
                failedLoginAttempts: 0,
                deviceInfo: userAgent.toString(),
                loginHistory: [{ ipAddress, device: userAgent.toString(), status: "Success" }],
            });
        }

        return res.status(200).json({ token, user });
    } catch (error) {
        console.error("Error during employee login:", error.message);
        return res.status(500).json({ message: "Internal Server error" });
    }
};
  
export const checkAuth = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated!" });
    }
    res.status(200).json({ message: "User is authenticated!", user: req.user });
};

export const logoutAccount = (req, res) => {
    try {
        if (!req.cookies.token) {
            return res.status(400).json({ success: false, message: "You are not logged in" });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error during logout" });
    }
};

export const getAllPositions = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found!" });
        }

        const positions = [...new Set(users.map(user => user.position).filter(position => position))];

        return res.status(200).json({ message: "Fetching unique positions successfully!", positions });
    } catch (error) {
        console.error(`Error in getting users: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getAllLoginActivities = async (req, res) => {
    try {
        const loginActivities = await LoginActivity.find().sort({ lastLogin: -1 }).lean();
        return res.status(200).json({ success: true, data: loginActivities });
    } catch (err) {
        console.error("Error fetching login activities:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logPageVisit = async (req, res) => {
    try {
        console.log("Received request:", req.body);
        const { pageName, duration } = req.body;
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!pageName || !duration) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingVisit = await PageVisit.findOne({ user_id: userId, pageName });

        if (existingVisit) {
            existingVisit.duration += parseFloat(duration);
            await existingVisit.save();
            return res.status(200).json({ message: "Page visit duration updated successfully" });
        } else {
            await PageVisit.create({
                user_id: userId,
                pageName,
                duration: parseFloat(duration),
            });

            return res.status(200).json({ message: "Page visit logged successfully" });
        }
    } catch (error) {
        console.error("Error logging page visit:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
  
export const getPageVisits = async (req, res) => {
    try {
      const pageVisits = await PageVisit.aggregate([
        {
          $group: {
            _id: "$pageName",
            totalVisits: { $sum: 1 },
            totalTimeSpent: { $sum: "$duration" },
            averageTimeSpent: { $avg: "$duration" },
          },
        },
        { $sort: { totalVisits: -1 } },
      ]);
  
      res.status(200).json(pageVisits);
    } catch (error) {
      console.error("Error fetching page visits:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const getAllPageVisits = async (req, res) => {
    try {
      const allPageVisits = await PageVisit.find()
        .lean();
  
      return res.status(200).json({ success: true, data: allPageVisits });
    } catch (err) {
      console.error("Error fetching login activities:", err.message);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};
