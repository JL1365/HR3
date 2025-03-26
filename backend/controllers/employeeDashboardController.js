import { BenefitRequest } from "../models/benefitRequestModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { EmployeeLeave } from "../models/employeeLeaveModel.js";
import { PayrollHistory } from "../models/payrollHistoryModel.js";
import mongoose from "mongoose";

export const getMyAppliedRequestCount = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
        const totalAppliedRequests = await BenefitRequest.countDocuments({ userId });
  
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
        const newRequestsCount = await BenefitRequest.countDocuments({
            userId,
            createdAt: { $gte: oneDayAgo }
        });
  
        const approvedCount = await BenefitRequest.countDocuments({ userId, status: "Approved" });
        const deniedCount = await BenefitRequest.countDocuments({ userId, status: "Denied" });
        const pendingCount = await BenefitRequest.countDocuments({ userId, status: "Pending" });
  
        res.status(200).json({ 
            status: true, 
            totalAppliedRequests, 
            newRequestsCount,
            approvedCount,
            deniedCount,
            pendingCount
        });
  
    } catch (error) {
        console.error(`Error in getting applied request count: ${error.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyTotalDeduction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? String(req.user.userId) : null;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const myDeductions = await BenefitDeduction.find({ userId })
      .populate({
        path: "BenefitRequestId",
        populate: {
          path: "compensationBenefitId",
          select: "benefitName",
        },
        select: "createdAt",
      })
      .select("amount BenefitRequestId createdAt") 
      .exec();

    const totalAmount = myDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    res.status(200).json({message: "Total deductions retrieved successfully.", totalAmount });
  } catch (error) {
    console.error(`Error in fetching deductions: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyTotalIncentivesGiven = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
        const totalIncentivesGiven = await IncentiveTracking.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
  
        const totalAmount = totalIncentivesGiven.length > 0 ? totalIncentivesGiven[0].totalAmount : 0;
  
        res.status(200).json({
            status: true,
            totalIncentivesGiven: totalAmount
        });
  
    } catch (error) {
        console.error(`Error in fetching total incentives given: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyLeavesCount = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
        const leavesCount = await EmployeeLeave.countDocuments({ employee_id: userId });
  
        res.status(200).json({
            status: true,
            leavesCount
        });
  
    } catch (error) {
        console.error(`Error in counting leaves: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyTotalSalary = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
        const totalSalary = await PayrollHistory.aggregate([
            { $match: { employee_id: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$netSalary" }
                }
            }
        ]);

        const totalAmount = totalSalary.length > 0 ? totalSalary[0].totalAmount : 0;

        res.status(200).json({
            status: true,
            totalSalary: totalAmount
        });

    } catch (error) {
        console.error(`Error in fetching total salary: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};
