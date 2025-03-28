import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { BenefitDeductionHistory } from "../models/benefitDeductionHistory.js";
import { Notification } from "../models/notificationModel.js";
import { io } from "../index.js";

export const addUserDeduction = async (req, res) => {
  try {
    const { userId, benefitRequestId, amount } = req.body;

    if (!userId || !benefitRequestId || amount == null || isNaN(amount)) {
      return res.status(400).json({
        message: "User ID, benefit request ID, and a valid numeric amount are required.",
      });
    }
    const numericAmount = parseFloat(amount);
    const serviceToken = generateServiceToken();
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );
    const users = response.data;
    const employeeExists = users.find(user => user._id === userId);

    if (!employeeExists) {
      return res.status(400).json({
        message: "The user does not exist in the system.",
      });
    }

    const benefitRequest = await BenefitRequest.findOne({
      _id: benefitRequestId,
      userId,
      status: "Approved", 
    }).populate("compensationBenefitId", "benefitName");

    if (!benefitRequest) {
      return res.status(400).json({
        message: "You cannot add a deduction because the benefit request is not approved.",
      });
    }
    const newDeduction = new BenefitDeduction({
      userId,
      benefitId: benefitRequest.benefitId,
      BenefitRequestId: benefitRequest._id,
      amount: numericAmount,
    });

    await newDeduction.save();

    io.emit("deductionAdded", {
      userId,
      message: `A deduction of ${numericAmount} has been applied for the benefit: ${benefitRequest.compensationBenefitId.benefitName}.`,
    });

    let deductionHistory = await BenefitDeductionHistory.findOne({
      userId,
      benefitRequestId: benefitRequest._id, 
    });
    if (deductionHistory) {
      deductionHistory.totalAmount += numericAmount;
      await deductionHistory.save();
    } else {
      deductionHistory = new BenefitDeductionHistory({
        userId,
        benefitRequestId: benefitRequest._id,
        totalAmount: numericAmount,
      });

      await deductionHistory.save();
    }

    const notificationMessage = `A deduction of ${numericAmount} has been applied for the benefit: ${benefitRequest.compensationBenefitId.benefitName}.`;
    await Notification.create({
      userId,
      message: notificationMessage,
    });

    res.status(201).json({message: "Deduction added successfully and notification sent.",deduction: newDeduction,deductionHistory});
  } catch (error) {
    console.error(`Error in adding user deduction: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBenefitDeductions = async (req, res) => {
  try {
    const allDeductions = await BenefitDeduction.find()
      .populate({
        path: 'BenefitRequestId',
        populate: {
          path: 'compensationBenefitId',
          model: 'CompensationBenefit',
        },
      })
      .exec();
    if (allDeductions.length === 0) {
      return res.status(404).json({
        message: 'No benefit deductions found.',
      });
    }
    const serviceToken = generateServiceToken();
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );
    const users = response.data;
    const updatedAllDeductions = allDeductions.map((deduction) => {
      const userId = deduction.userId ? deduction.userId.toString() : null;
      if (!userId) {
        console.log("No userId found for deduction:", deduction._id);
        return {
          ...deduction.toObject(),
          user: null,
        };
      }
      const user = users.find((user) => user._id === userId);
      return {
        ...deduction.toObject(),
        user: user ? { firstName: user.firstName, lastName: user.lastName } : null,
      };
    });

    res.status(200).json({
      message: 'All benefit deductions retrieved successfully.',
      deductions: updatedAllDeductions,
    });
  } catch (error) {
    console.error(`Error in fetching all benefit deductions: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTotalDeductions = async (req, res) => {
  try {
    const totalDeductions = await BenefitDeduction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    const totalAmount = totalDeductions.length > 0 ? totalDeductions[0].totalAmount : 0;

    res.status(200).json({
      status: true,
      totalDeductions: totalAmount
    });

  } catch (error) {
    console.error(`Error in fetching total benefit deductions: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserDeduction = async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    if (!id || amount == null || isNaN(amount)) {
      return res.status(400).json({
        message: "Deduction ID and a valid numeric amount are required.",
      });
    }

    const numericAmount = parseFloat(amount);

    let existingDeduction = await BenefitDeduction.findById(id);

    if (!existingDeduction) {
      return res.status(404).json({ message: "Deduction not found." });
    }

    existingDeduction.amount = numericAmount;
    await existingDeduction.save();

    let deductionHistory = await BenefitDeductionHistory.findOne({
      userId: existingDeduction.userId,
      benefitRequestId: existingDeduction.BenefitRequestId,
    });

    if (deductionHistory) {
      deductionHistory.totalAmount = numericAmount;
      await deductionHistory.save();
    }

    res.status(200).json({message: "Deduction updated successfully.",deduction: existingDeduction,deductionHistory,});

  } catch (error) {
    console.error(`Error in updating user deduction: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyDeduction = async (req, res) => {
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

    if (myDeductions.length === 0) {
      return res.status(404).json({ message: "No deductions found for this user." });
    }

    res.status(200).json({message: "Deductions retrieved successfully.",deductions: myDeductions,});
  } catch (error) {
    console.error(`Error in fetching deductions: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
