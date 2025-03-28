import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js   ";
import { BudgetRequest } from "../models/finance/budgetRequestModel.js";

export const requestBudget = async (req, res) => {
    try {
        console.log("Received file:", req.file);
        console.log("Received body:", req.body);

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { requestId, totalBudget, category, reason } = req.body;

        const department = "HR3";

        if (category !== "Operational Expenses") {
            return res.status(400).json({ message: "HR3 must use category: 'Operational Expenses'." });
        }

        const budgetAmount = Number(totalBudget);
        if (isNaN(budgetAmount)) {
            return res.status(400).json({ message: "totalBudget must be a number." });
        }

        const documentUrl = req.file.path;
        const newRequest = new BudgetRequest({
            requestId,
            department,
            status: "Pending",
            totalBudget: budgetAmount,
            category,
            reason,
            documents: documentUrl,
        });

        const savedRequest = await newRequest.save()
        const data = {
            approvalId: savedRequest._id,
            department: savedRequest.department,
            status: savedRequest.status,
            totalBudget: savedRequest.totalBudget,
            category: savedRequest.category,
            reason: savedRequest.reason,
            documents: savedRequest.documents,
            comment: savedRequest.comment,
        }
        console.log("Data to send to finance:", data);
        const token = generateServiceToken();
        const sendRequest = await axios.post(`https://gateway.jjm-manufacturing.com/finance/budget-request`, data,{
            headers: { Authorization: `Bearer ${token}` },
        });
        res.status(200).json({ message: "Budget request sent to Finance", data: sendRequest.data });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error processing budget request", error: error.message });
    }
};

export const updateBudgetRequest = async (req, res) => {
    try {
        const { approvalId, status, comment} = req.body;
        console.log(req.body)

        if (!approvalId || !status) {
            return res.status(400).json({ message: "Approval ID and status are required." });
        }

        let existingRequest = await BudgetRequest.findById(approvalId);

        if (!existingRequest) {
            return res.status(404).json({ message: "Budget request not found." });
        }

        existingRequest.status = status;
        existingRequest.comment = comment;

        const updatedRequest = await existingRequest.save();

        const financeData = {
            approvalId: updatedRequest._id,
            status: updatedRequest.status,
            comment: updatedRequest.comment,
        };
        console.log("finance data:", financeData);

        res.status(200).json({ message: "Budget request updated successfully", updatedRequest });

    } catch (error) {
        console.error("Error updating budget request:", error);
        res.status(500).json({ message: "Error updating budget request", error: error.message });
    }
};

export const getBudgetRequests = async (req, res) => {
    try {
        const budgetRequests = await BudgetRequest.find();
        res.status(200).json(budgetRequests);
    } catch (error) {
        console.error("Error fetching budget requests:", error);
        res.status(500).json({ message: "Error retrieving budget requests", error: error.message });
    }
};



// export const updateBudgetRequest = async (req, res) => {
//     try {
//         const { approvalId, status, comment } = req.body;
//         console.log(req.body);
//         const serviceToken = generateServiceToken();
//         const response = await axios.get(
//             `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
//             { headers: { Authorization: `Bearer ${serviceToken}` } }
//         );

//         const users = response.data;
//         if (!approvalId || !status) {
//             return res.status(400).json({ message: "Approval ID and status are required." });
//         }

//         let existingRequest = await BudgetRequest.findById(approvalId);

//         if (!existingRequest) {
//             return res.status(404).json({ message: "Budget request not found." });
//         }

//         existingRequest.status = status;
//         existingRequest.comment = comment;

//         const updatedRequest = await existingRequest.save();

//         const financeData = {
//             approvalId: updatedRequest._id,
//             status: updatedRequest.status,
//             comment: updatedRequest.comment,
//         };
//         console.log("finance data:", financeData);

//         const admins = users.filter(user => user.role === "Admin");
//         const notifications = admins.map(admin => ({
//             userId: admin._id,
//             message: `Budget request ${updatedRequest._id} has been updated to ${updatedRequest.status}`,
//         }));
//         await Notification.insertMany(notifications);

//         const adminNotifications = await Notification.find({ userId: { $in: admins.map(admin => admin._id) } });

//         const eventData = {
//             message: `Budget request ${updatedRequest._id} has been updated to ${updatedRequest.status}`,
//         };
//         io.emit("updatedBudgetRequest", eventData);
//         console.log("Real-time event emitted: updatedBudgetRequest", eventData);

//         res.status(200).json({ 
//             message: "Budget request updated successfully", 
//             updatedRequest, 
//             adminNotifications 
//         });

//     } catch (error) {
//         console.error("Error updating budget request:", error);
//         res.status(500).json({ message: "Error updating budget request", error: error.message });
//     }
// };

// export const getBudgetRequests = async (req, res) => {
//     try {
//         const budgetRequests = await BudgetRequest.find();
//         res.status(200).json(budgetRequests);
//     } catch (error) {
//         console.error("Error fetching budget requests:", error);
//         res.status(500).json({ message: "Error retrieving budget requests", error: error.message });
//     }
// };
