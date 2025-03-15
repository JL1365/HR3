import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";
import upload from '../configs/multerConfig.js';
import { CompensationBenefit } from "../models/compensationBenefitModel.js";
import axios from 'axios'

export const applyBenefit = async (req, res) => {
  try {
    const userId = req.user && req.user.userId ? String(req.user.userId) : null;
    console.log("User ID from token:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token." });
    }

    const { compensationBenefitId } = req.body;

    if (!compensationBenefitId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const serviceToken = generateServiceToken();
    const response = await axios.get(
      `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
      {
        headers: { Authorization: `Bearer ${serviceToken}` },
      }
    );

    const users = response.data;
    console.log("Users from API Gateway:", users);

    const employeeExists = users.find(user => String(user._id) === userId);

    if (!employeeExists) {
      console.error(`User with ID ${userId} not found in the system.`);
      return res.status(404).json({ message: "User not found in the system." });
    }

    const existingRequest = await BenefitRequest.findOne({ userId, compensationBenefitId });
    if (existingRequest) {
      return res.status(400).json({
        message: "You have already requested this benefit.",
      });
    }

    const benefit = await CompensationBenefit.findById(compensationBenefitId);
    if (!benefit) {
      return res.status(404).json({
        message: "Benefit not found.",
      });
    }

    if (benefit.isNeedRequest) {
      if (!req.files || !req.files.frontId || !req.files.backId) {
        return res.status(400).json({
          message: "Please upload both front and back ID images.",
        });
      }
    }
    const frontIdUrl = req.files.frontId ? req.files.frontId[0].path : null;
    const backIdUrl = req.files.backId ? req.files.backId[0].path : null;
    const newRequest = new BenefitRequest({
      userId,
      compensationBenefitId,
      uploadDocs: {
        frontId: frontIdUrl,
        backId: backIdUrl,
      },
      status: "Pending",
    });

    await newRequest.save();

    res.status(201).json({
      message: "Benefit request submitted successfully",
      requestId: newRequest._id,
    });
  } catch (error) {
    console.error(`Error in applying benefit: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { upload };

export const getMyApplyRequests = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);

    const userId = req.user && req.user.userId ? String(req.user.userId) : null;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const myApplyRequests = await BenefitRequest.find({ userId })
      .populate("compensationBenefitId", "benefitName");

    res.status(200).json({ status: true, myApplyRequests });
  } catch (error) {
    console.error(`Error in getting my apply requests: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllAppliedRequest = async (req, res) => {
  try {
      const allRequestBenefit = await BenefitRequest.find({})
      .populate("compensationBenefitId")


      if (allRequestBenefit.length === 0) {
          return res.status(404).json({ message: "No request found!" });
      }

      const serviceToken = generateServiceToken();

      const response = await axios.get(
          `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
          {
              headers: { Authorization: `Bearer ${serviceToken}` },
          }
      );

      const users = response.data.accounts || response.data;

      const updatedRequestBenefit = allRequestBenefit.map((requestBenefit) => {
          const user = users.find(
              (user) => user._id.toString() === requestBenefit.userId.toString()
          );

          return {
              ...requestBenefit.toObject(),
              user: user
                  ? { firstName: user.firstName, lastName: user.lastName ,position:user.position }
                  : { firstName: "Unknown", lastName: "User" },
          };
      });
      res.status(200).json({ data:updatedRequestBenefit });
  } catch (error) {
      console.error(`Error in getting all applied requests: ${error.message}`);
      return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateApplyRequestStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body;

    const validStatuses = ["Approved", "Denied", "Pending"];
    const finalStatuses = ["Approved", "Denied"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status provided. Status must be one of: Approved, Denied, Pending.",
      });
    }

    const currentRequest = await BenefitRequest.findById(id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Benefit request not found." });
    }

    if (finalStatuses.includes(currentRequest.status)) {
      return res.status(400).json({message: `Cannot change status from ${currentRequest.status}. It has already been finalized.`,});
    }

    const updatedRequest = await BenefitRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({message: "Benefit request status updated successfully.",updatedRequest,});
  } catch (error) {
    console.error(`Error in Updating request status: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
