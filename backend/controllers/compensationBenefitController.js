import { CompensationBenefit } from "../models/compensationBenefitModel.js";
import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { EmployeeCompensation } from "../models/employeeCompensationModel.js";

export const createBenefit = async (req, res) => {
    try {
      const { benefitName, benefitType, benefitAmount, isNeedRequest, isAvailable } = req.body;
  
      const isExistingBenefit = await CompensationBenefit.findOne({ benefitName });
      if (isExistingBenefit) {
        return res.status(400).json({ message: "Compensation Benefit Already Exists!" });
      }
  
      let benefitData = { benefitName, benefitType, benefitAmount, isAvailable };
  
      if (benefitType === "Paid Benefit") {
        benefitData.isNeedRequest = false;
      } else if (benefitType === "Deductible Benefit") {
        if (typeof isNeedRequest === "undefined") {
          return res.status(400).json({ message: "isNeedRequest is required for Deductible Benefit!" });
        }
        benefitData.isNeedRequest = isNeedRequest;
      }
  
      const benefit = new CompensationBenefit(benefitData);
      await benefit.save();
  
      res.status(201).json({
        success: true,
        message: "Benefit created successfully",
        data: {
          benefitName: benefit.benefitName,
          benefitType: benefit.benefitType,
          benefitAmount: benefit.benefitAmount,
          isNeedRequest: benefit.isNeedRequest,
          isAvailable: benefit.isAvailable,
        },
      });
    } catch (error) {
      console.log(`Error in creating benefits: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  };  

export const getAllBenefits = async (req, res) => {
    try {
        const benefits = await CompensationBenefit.find();
        res.status(200).json({message:"Successfully retrieved benefits",data: benefits });
    } catch (error) {
        console.log(`Error in retrieving benefits: ${error.message}`);
        res.status(500).json({message: "Internal server error"});
    }
};

export const getBenefitById = async (req, res) => {
    try {
        const benefit = await CompensationBenefit.findById(req.params.id);
        if (!benefit) return res.status(404).json({message: "Benefit not found" });
        res.status(200).json({data: benefit });
    } catch (error) {
        console.log(`Error in retrieving benefits by id: ${error.message}`);
        res.status(500).json({message: "Internal server error"});
    }
};

export const updateBenefit = async (req, res) => {
    try {
        const { benefitName } = req.body;
        const benefitId = req.params.id;
        const existingBenefit = await CompensationBenefit.findOne({ 
            benefitName,
            _id: { $ne: benefitId }
        });
        if (existingBenefit) {
            return res.status(400).json({ message: "Benefit name already exists!" });
        }
        const benefit = await CompensationBenefit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!benefit) return res.status(404).json({ message: "Benefit not found" });
        res.status(200).json({ message: "Benefit updated successfully", data: benefit });
    } catch (error) {
        console.log(`Error in updating benefits: ${error.message}`);
        res.status(500).json({ message: "Internal server error"});
    }
};

export const deleteBenefit = async (req, res) => {
    try {
        const benefit = await CompensationBenefit.findByIdAndDelete(req.params.id);
        if (!benefit) return res.status(404).json({message: "Benefit not found" });
        res.status(200).json({message: "Benefit deleted successfully" });
    } catch (error) {
        console.log(`Error in deleting benefits: ${error.message}`);
        res.status(500).json({message: "Internal server error"});
    }
};

export const getEmployeeCompensation = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`, 
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;
        const compensations = await EmployeeCompensation.find().populate('benefit');

        if (!compensations || compensations.length === 0) {
            return res.status(404).json({ message: "No compensations found" });
        }

        const updatedCompensations = compensations.map((compensation) => {
            const user = users.find((u) => u._id === compensation.employeeId?.toString());
            return {
                ...compensation.toObject(),
                employeeName: user ? `${user.firstName} ${user.lastName}` : "Unknown Employee",
                benefitName: compensation.benefit ? compensation.benefit.benefitName : "Unknown Benefit",
                totalAmount: compensation.benefitType === "Deduction" ? compensation.deductionAmount : compensation.daysLeave * (compensation.benefit ? compensation.benefit.benefitAmount : 0),
            };
        });

        res.status(200).json({ success: true, data: updatedCompensations });
    } catch (error) {
        console.error(`Error in fetching employee compensation: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};
