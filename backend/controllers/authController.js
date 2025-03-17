import axios from 'axios';
import bcrypt from 'bcryptjs';

import {generateServiceToken} from '../middlewares/gatewayTokenGenerator.js';
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js'

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
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data;
        const user = users.find((u) => u.email === email && u.role === "Admin");

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateTokenAndSetCookie(res, user);

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
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data;
        const user = users.find((u) => u.email === email && u.role === "Employee");

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateTokenAndSetCookie(res, user);

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
