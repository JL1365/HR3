import axios from 'axios';
import bcrypt from 'bcryptjs';

import {generateServiceToken} from '../middlewares/gatewayTokenGenerator.js';
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js'

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const serviceToken = generateServiceToken();    
      const response = await axios.get(
        `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
        {
          headers: { Authorization: `Bearer ${serviceToken}` },
        }
      );
  
      const users = response.data;
      const user = users.find((u) => u.email === email);
  
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
      console.error("Error during login:", error.message);
      return res.status(500).json({ message: "Internal Server error" });
    }
  };
  