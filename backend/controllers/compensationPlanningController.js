import axios from "axios";
import mongoose from 'mongoose';

import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { CompensationPlanning } from "../models/compensationPlanningModel.js";

export const createCompensationPlan = async (req, res) => {
    try {
        const { position, hourlyRate, overTimeRate, holidayRate, benefits } = req.body;
        if (!position) {
            return res.status(400).json({message: "Position is required!" });
        }
        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });
        const user = response.data.find(user => user.position === position);
        if (!user) {
            return res.status(400).json({message: "Position not found in Users!" });
        }
        const isPositionExist = await CompensationPlanning.findOne({ position: user._id });
        if (isPositionExist) {
            return res.status(400).json({message: "Position already exists!" });
        }
        const newPlan = await CompensationPlanning.create({
            position: user._id,
            hourlyRate,
            overTimeRate,
            holidayRate,
            benefits
        });

        res.status(201).json({message: "Compensation created successfully!", data: newPlan });
    } catch (error) {
        console.error("Error creating compensation plan:", error.message);
        res.status(500).json({message: "Internal Server error"});
    }
};

export const getCompensationPlan = async (req, res) => {
    try {
        const compensationPlans = await CompensationPlanning.find();
        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const users = response.data; 
        const positionMap = {};
        users.forEach(user => {
            positionMap[user._id] = user.position; 
        });
        const formattedPlans = compensationPlans.map(plan => ({
            ...plan._doc,
            positionName: positionMap[plan.position] || "Unknown Position"
        }));
        res.status(200).json({data: formattedPlans });
    } catch (error) {
        console.error(`Error in getting compensation plans: ${error.message}`);
        res.status(500).json({message: "Internal Server error"});
    }
};

export const updateCompensationPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { hourlyRate, overTimeRate, holidayRate, benefits } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Compensation Plan ID is required!" });
        }

        const existingPlan = await CompensationPlanning.findById(id);
        if (!existingPlan) {
            return res.status(404).json({ message: "Compensation Plan not found!" });
        }

        existingPlan.hourlyRate = hourlyRate ?? existingPlan.hourlyRate;
        existingPlan.overTimeRate = overTimeRate ?? existingPlan.overTimeRate;
        existingPlan.holidayRate = holidayRate ?? existingPlan.holidayRate;
        existingPlan.benefits = benefits ?? existingPlan.benefits;

        await existingPlan.save();

        res.status(200).json({ message: "Compensation Plan updated successfully!", data: existingPlan });
    } catch (error) {
        console.error("Error updating compensation plan:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllGrievance = async (req, res) => {
    try {
      const serviceToken = generateServiceToken();
  
      const response = await axios.get(
        `${process.env.API_GATEWAY_URL}/hr4/EmComplaint`,
        {
            headers: { Authorization: `Bearer ${serviceToken}` },

        }
      );
  
      console.log("Fetched data:", response.data);
  
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: "Server error" });
    }
};

export const getGrievances = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/hr4/EmComplaint`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });
        res.status(200).json({ data: response.data });
    } catch (error) {
        console.error("Error fetching grievances:", error.message);
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const getMySalaryStructure = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const serviceToken = generateServiceToken();
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const user = response.data.find(user => user._id === userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const compensationPlan = await CompensationPlanning.findOne({ position: user._id });
        if (!compensationPlan) {
            return res.status(404).json({ message: 'Compensation plan not found for your position' });
        }

        const positionName = user.position; 

        res.status(200).json({
            message: 'Salary structure fetched successfully',
            data: {
                ...compensationPlan._doc,
                position: positionName
            }
        });
    } catch (error) {
        console.error('Error fetching salary structure:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};