import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { BenefitDocument } from "../models/benefitDocumentsModel.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";
import axios from 'axios';

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
