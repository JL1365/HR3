import { Notification } from "../models/notificationModel.js";
import { BenefitRequest } from "../models/benefitRequestModel.js";

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

    // Create a notification for the employee
    await Notification.create({
      userId: currentRequest.userId,
      message: `Your benefit request has been ${status.toLowerCase()}.`,
    });

    res.status(200).json({message: "Benefit request status updated successfully.",updatedRequest,});
  } catch (error) {
    console.error(`Error in Updating request status: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
