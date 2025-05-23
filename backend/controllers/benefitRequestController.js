import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";
import upload from '../configs/multerConfig.js';
import { CompensationBenefit } from "../models/compensationBenefitModel.js";
import axios from 'axios'
import { Notification } from "../models/notificationModel.js";
import { io } from "../index.js";

export const applyBenefit = async (req, res) => {
  try {
    const userId = req.user?.userId ? String(req.user.userId) : null;
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
      { headers: { Authorization: `Bearer ${serviceToken}` } }
    );

    const users = response.data;
    const employee = users.find(user => String(user._id) === userId);
    if (!employee) {
      return res.status(404).json({ message: "User not found in the system." });
    }

    const latestRequest = await BenefitRequest.findOne({
      userId,
      compensationBenefitId
    }).sort({ createdAt: -1 });

    if (latestRequest) {
      if (latestRequest.status === "Pending") {
        return res.status(400).json({
          message: "You have a pending request for this benefit.",
        });
      }

      if (latestRequest.status === "Approved") {
        return res.status(400).json({
          message: "You are already approved for this benefit.",
        });
      }

    }

    const benefit = await CompensationBenefit.findById(compensationBenefitId);
    if (!benefit) {
      return res.status(404).json({ message: "Benefit not found." });
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

    const admins = users.filter(user => user.role === "Admin");
    const notifications = admins.map(admin => ({
      userId: admin._id,
      message: `${employee.firstName} ${employee.lastName} applied for ${benefit.benefitName}`,
    }));
    await Notification.insertMany(notifications);

    const eventData = {
      userId,
      message: `${employee.firstName} ${employee.lastName} applied for ${benefit.benefitName}`,
    };
    io.emit("benefitApplied", eventData);
    console.log("Real-time event emitted: benefitApplied", eventData);

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
    const { status, comment } = req.body;

    const validStatuses = ["Approved", "Denied", "Pending"];
    const finalStatuses = ["Approved", "Denied"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status provided. Status must be one of: Approved, Denied, Pending.",
      });
    }

    if (status === "Denied" && (!comment || comment.trim() === "")) {
      return res.status(400).json({
        message: "Comment is required when denying a request.",
      });
    }

    const currentRequest = await BenefitRequest.findById(id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Benefit request not found." });
    }

    if (finalStatuses.includes(currentRequest.status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentRequest.status}. It has already been finalized.`,
      });
    }

    const updatedRequest = await BenefitRequest.findByIdAndUpdate(
      id,
      { 
        status, 
        comment: status === "Approved" ? "Request approved successfully." : comment 
      },
      { new: true }
    ).populate("compensationBenefitId", "benefitName");

    const notificationMessage = `Your request for ${updatedRequest.compensationBenefitId.benefitName} has been ${status}.`;
    await Notification.create({
      userId: currentRequest.userId,
      message: notificationMessage,
    });

    io.emit("requestStatusUpdated", {
      userId: currentRequest.userId,
      message: notificationMessage,
    });

    res.status(200).json({
      message: "Benefit request status updated successfully.",
      updatedRequest,
    });
  } catch (error) {
    console.error(`Error in Updating request status: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
