import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { BenefitDocument } from "../models/benefitDocumentsModel.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";
import axios from 'axios';
import { PayrollHistory } from "../models/payrollHistoryModel.js";

export const getAllEmployeeBenefitDetails = async (req, res) => {
  try {
    const benefitRequests = await BenefitRequest.find({ status: "Approved" })
      .populate("compensationBenefitId", "benefitName benefitType")
      .lean();

    const benefitDeductions = await BenefitDeduction.find()
      .populate({
        path: "BenefitRequestId",
        populate: {
          path: "compensationBenefitId",
          model: "CompensationBenefit",
          select: "benefitName benefitType",
        },
      })
      .select("amount createdAt BenefitRequestId")
      .lean();

    const serviceToken = generateServiceToken();
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;

    const mappedBenefitRequests = benefitRequests.map((request) => {
      const user = users.find((u) => u._id === request.userId.toString());

      return {
        ...request,
        userId: user
          ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
      };
    });

    const mappedBenefitDeductions = benefitDeductions.map((deduction) => {
      const benefitRequest = deduction.BenefitRequestId;
      const userId = benefitRequest?.userId?.toString();
      const user = users.find((u) => u._id === userId);

      return {
        ...deduction,
        user: user
          ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
      };
    });

    return res.status(200).json({
      benefitRequests: mappedBenefitRequests,
      benefitDeductions: mappedBenefitDeductions,
    });
  } catch (error) {
    console.error("Error in getAllEmployeeBenefitDetails:", error.message);
    return res
      .status(500)
      .json({ message: "Error fetching benefit details." });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    console.log(req.file); 

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { description,remarks } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const fileUrl = req.file.path;

    const newDocument = new BenefitDocument({
      documentFile: fileUrl,
      description,
      remarks:remarks || "",
    });

    await newDocument.save();

    res.status(200).json({ message: 'File uploaded successfully', document: newDocument });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

export const getUploadedDocuments = async (req, res) => {
  try {
    const documents = await BenefitDocument.find({});
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found!" });
    }
    res.status(200).json({ message: "Fetching documents success:", documents });
  } catch (error) {
    console.log(`Error in fetching documents: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const calculate13MonthPay = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const payrolls = await PayrollHistory.aggregate([
      {
        $match: {
          payroll_date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $addFields: {
          totalDaysWorked: {
            $size: {
              $filter: {
                input: "$dailyWorkHours",
                as: "day",
                cond: { $gt: ["$$day.hours", 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$employee_id",
          employee_firstname: { $first: "$employee_firstname" },
          employee_lastname: { $first: "$employee_lastname" },
          totalGrossSalary: { $sum: "$grossSalary" },
          totalDaysWorked: { $sum: "$totalDaysWorked" },
          batch_ids: { $addToSet: "$batch_id" }
        }
      },
      {
        $project: {
          _id: 0,
          employee_id: "$_id",
          employee_name: {
            $concat: ["$employee_firstname", " ", "$employee_lastname"]
          },
          totalGrossSalary: 1,
          totalDaysWorked: 1,
          batch_ids: 1,
          thirteenthMonthPay: {
            $round: [{ $divide: ["$totalGrossSalary", 12] }, 2]
          }
        }
      },
      { $sort: { employee_name: 1 } }
    ]);

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "No payroll records found for the current year." });
    }

    return res.status(200).json({
      message: "13th-month pay calculated successfully for the current year.",
      data: payrolls
    });
  } catch (error) {
    console.error("Error in calculate13MonthPay:", error.message);
    return res.status(500).json({ message: "Error calculating 13th-month pay." });
  }
};
