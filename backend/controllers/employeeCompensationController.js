import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { EmployeeCompensation } from "../models/employeeCompensationModel.js";
import { CompensationBenefit } from "../models/compensationBenefitModel.js";
import axios from "axios";

export const addEmployeeCompensation = async (req, res) => {
    try {
        const { employeeId, benefit, benefitType, daysLeave } = req.body;

        // Validate required fields
        if (!employeeId || !benefit || !benefitType) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Validate user existence via external API
        const serviceToken = generateServiceToken();
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const users = response.data;
        const userExists = users.find(user => user._id === employeeId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Fetch benefit details
        const benefitDetails = await CompensationBenefit.findById(benefit);
        if (!benefitDetails) {
            return res.status(404).json({ message: "Benefit not found." });
        }

        if (benefitDetails.benefitType !== benefitType) {
            return res.status(400).json({ message: "Benefit type mismatch." });
        }

        // Prepare the compensation data
        const compensationData = {
            employeeId,
            benefit,
            benefitType,
            isAlreadyAdded: true
        };

        if (benefitType === "Paid Benefit") {
            if (!daysLeave || daysLeave <= 0) {
                return res.status(400).json({ message: "Days of leave must be greater than 0." });
            }
            compensationData.daysLeave = daysLeave;
            compensationData.totalAmount = daysLeave * benefitDetails.benefitAmount; // Calculate total amount
        } else if (benefitType === "Deductible Benefit") {
            compensationData.deductionAmount = benefitDetails.benefitAmount; // Use benefitAmount for deduction
            delete compensationData.daysLeave; // Ensure daysLeave is not included
        } else {
            return res.status(400).json({ message: "Invalid benefit type." });
        }

        // Save to database
        const newCompensation = new EmployeeCompensation(compensationData);
        await newCompensation.save();

        res.status(201).json({ message: "Employee compensation added successfully.", data: newCompensation });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};