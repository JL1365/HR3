import axios from 'axios';
import { generateServiceToken } from '../middlewares/gatewayTokenGenerator.js';
import { Audit } from '../models/core2/auditModel.js';

export const getAllAudits = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        const response = await axios.get(
            'https://backend-core2.jjm-manufacturing.com/api/auditCompletedTasksHr3',
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const auditData = response.data;

        if (!auditData || auditData.length === 0) {
            return res.status(404).json({ message: "No audit data found!" });
        }

        return res.status(200).json({ message: "Fetching audit data successfully!", auditData });
    } catch (error) {
        console.error(`Error in getting audit data: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const createAudit = async (req, res) => {
    const { department, description, task } = req.body;

    try {
        const newAudit = new Audit({ department, description, task });
        const savedAudit = await newAudit.save();

        const serviceToken = generateServiceToken();

        const response = await axios.post(
            'https://backend-core2.jjm-manufacturing.com/api/auditRequestHr3',
            { department, description, task },
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );

        const createdAudit = response.data;

        return res.status(201).json({ message: "Audit created successfully!", createdAudit, savedAudit });
    } catch (error) {
        console.error(`Error in creating audit: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getMyRequest = async (req, res) => {
    try {
        const audits = await Audit.find();
        if (!audits || audits.length === 0) {
            return res.status(404).json({ message: "No audit requests found!" });
        }
        return res.status(200).json({ message: "Fetching audit requests successfully!", audits });
    } catch (error) {
        console.error(`Error in getting audit requests: ${error.message}`);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
