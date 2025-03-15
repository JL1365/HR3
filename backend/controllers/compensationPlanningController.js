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