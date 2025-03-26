import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import axios from 'axios'
import { BenefitRequest } from "../models/benefitRequestModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { EmployeeLeave } from "../models/employeeLeaveModel.js";
import { PayrollHistory } from "../models/payrollHistoryModel.js";

export const getAllUserCount = async (req, res) => {
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
            return res.status(404).json({ message: "No users found!", count: 0 });
        }

        return res.status(200).json({ message: "User count fetched successfully!", count: users.length });
    } catch (error) {
        console.error(`Error in getting user count: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getAllAppliedRequestCount = async (req, res) => {
    try {
        const totalAppliedRequests = await BenefitRequest.countDocuments();
  
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
        const newRequestsCount = await BenefitRequest.countDocuments({
            createdAt: { $gte: oneDayAgo }
        });
  
        const approvedCount = await BenefitRequest.countDocuments({ status: "Approved" });
  
        const deniedCount = await BenefitRequest.countDocuments({ status: "Denied" });
        const pendingCount = await BenefitRequest.countDocuments({ status: "Pending" });
  
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
  export const getEmployeeIncentiveCount = async (req, res) => {
    try {
      const employeesWithIncentives = await IncentiveTracking.aggregate([
        {
          $group: {
            _id: "$userId"
          }
        },
        {
          $count: "totalEmployeesGivenIncentives"
        }
      ]);
  
      const count = employeesWithIncentives.length > 0 ? employeesWithIncentives[0].totalEmployeesGivenIncentives : 0;
  
      res.status(200).json({
        status: true,
        totalEmployeesGivenIncentives: count
      });
  
    } catch (error) {
      console.error(`Error in counting employees with incentives: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export const getTotalIncentivesGiven = async (req, res) => {
    try {
      const totalIncentivesGiven = await IncentiveTracking.aggregate([
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
  
  export const getEmployeeLeaveCount = async (req, res) => {
    try {
      const employeeWithLeaves = await EmployeeLeave.aggregate([
        {
          $group: {
            _id: "$userId"
          }
        },
        {
          $count: "totalEmployeesGivenIncentives"
        }
      ]);
  
      const count = employeeWithLeaves.length > 0 ? employeeWithLeaves[0].totalEmployeesGivenIncentives : 0;
  
      res.status(200).json({
        status: true,
        employeeWithLeaves: count
      });
  
    } catch (error) {
      console.error(`Error in counting employees with leaves: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const getEmployeeSalary = async (req, res) => {
    try {
        const totalSalary = await PayrollHistory.aggregate([
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