import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";

import { Incentive } from "../models/incentiveModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";


import axios from 'axios'; 

export const createIncentiveTracking = async (req, res) => {
    try {
        const { userId, incentiveId, amount, description, earnedDate } = req.body;
        const processedBy = req.user.id;

        const serviceToken = generateServiceToken();

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;

        const userExists = users.find(user => user._id === userId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const incentiveExists = await Incentive.findById(incentiveId);
        if (!incentiveExists) {
            return res.status(404).json({ success: false, message: "Incentive not found!" });
        }

        const newTracking = new IncentiveTracking({
            userId,
            incentiveId,
            amount,
            description,
            earnedDate,
            processedBy,
            status: "Pending",
        });

        await newTracking.save();
        return res.status(201).json({ success: true, message: "Incentive recorded successfully!", data: newTracking });
    } catch (error) {
        console.error("Error creating incentive tracking:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllIncentiveTracking = async (req, res) => {
    try {
        const allIncentivesTracking = await IncentiveTracking.find({})
        .populate('incentiveId');

        const serviceToken = generateServiceToken();

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;

        const updatedIncentiveTrackings = allIncentivesTracking.map(tracking => {
            const user = users.find(user => user._id === tracking.userId.toString());
            return {
                ...tracking.toObject(),
                user: user ? { firstName: user.firstName, lastName: user.lastName } : null
            };
        });
        

        return res.status(200).json(updatedIncentiveTrackings);
    } catch (error) {
        console.error("Error fetching recognition programs:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateIncentiveTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, earnedDate, userId } = req.body;

        const existingTracking = await IncentiveTracking.findById(id);
        if (!existingTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        const serviceToken = generateServiceToken();

        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`, 
            { headers: { Authorization: `Bearer ${serviceToken}` } }
        );

        const users = response.data;

        const userExists = users.find(user => user._id === userId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }
        const updatedTracking = await IncentiveTracking.findByIdAndUpdate(
            id,
            {
                amount,
                description,
                earnedDate,
                userId,
                user: { firstName: userExists.firstName, lastName: userExists.lastName },
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Incentive tracking updated successfully!", data: updatedTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteIncentiveTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTracking = await IncentiveTracking.findByIdAndDelete(id);

        if (!deletedTracking) {
            return res.status(404).json({ success: false, message: "Incentive tracking record not found!" });
        }

        res.status(200).json({ success: true, message: "Incentive tracking record deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const getMyIncentiveTracking = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if(!userId){
            return res.status(401).json({message:'User not authenticated.'});
        }
        const myIncentivesTracking = await IncentiveTracking.find({ userId })
            .populate("incentiveId", "incentiveName incentiveType amount dateGiven status");

        res.status(200).json({ success: true, data: myIncentivesTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};