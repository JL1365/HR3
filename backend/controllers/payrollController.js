import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import Batch from "../models/batchModel.js";
import { EmployeeLeave } from "../models/employeeLeaveModel.js";
import { Attendance } from "../models/attendanceModel.js";

export const getLeavesFromHr1 = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();
  
        const response = await axios.get(`${process.env.API_GATEWAY_URL}/hr1/get-approved-leaves`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });
  
        console.log("Fetched data:", response.data);
  
        const leaveRecords = response.data.data; 
  
        for (const leave of leaveRecords) {
            const { employee_id, leave_id, leave_type, employee_firstname, employee_lastname } = leave;
  
            const existingLeave = await EmployeeLeave.findOne({ employee_id, "leaves.leave_id": leave_id });
  
            if (existingLeave) {
                console.log(`Leave ID ${leave_id} already exists. Skipping...`);
                continue;
            }
  
            let behavior = await EmployeeLeave.findOne({ employee_id });
  
            if (!behavior) {
                behavior = new EmployeeLeave({
                    employee_id,
                    employee_firstname,
                    employee_lastname,
                    leave_count: 0,
                    leave_types: {},
                    leaves: [],
                    isAlreadyAdded: false
                });
            }
  
            behavior.leave_count += 1;
  
            if (!behavior.leave_types[leave_type]) {
                behavior.leave_types[leave_type] = 0;
            }
            behavior.leave_types[leave_type] += 1;
  
            behavior.leaves.push({ leave_id, leave_type });
  
            await behavior.save();
        }
  
        res.status(200).json({ success: true, leaves: leaveRecords });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function generateBatchId() {
    const now = new Date();
    const activeBatch = await Batch.findOne({
        expiration_date: { $gte: now },
    });
  
    if (activeBatch) {
        return activeBatch.batch_id;
    } else {
        const newBatchId = `batch-${now.getTime()}`;
        const expirationDate = new Date(now);
        expirationDate.setDate(now.getDate() + 15);
  
        const newBatch = new Batch({
            batch_id: newBatchId,
            expiration_date: expirationDate,
        });
  
        await newBatch.save();
        return newBatchId;
    }
}

export const getAttendanceFromHr1 = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();
  
        const response = await axios.get(
            `${process.env.API_GATEWAY_URL}/hr1/get-time-tracking`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );
    
        const attendanceData = response.data;
        const batchId = await generateBatchId();
  
        for (const record of attendanceData) {
            const { employee_id, employee_firstname, employee_lastname, position, time_in, time_out, total_hours, overtime_hours, entry_type, isHoliday } = record;
  
            const existingAttendance = await Attendance.findOne({
                employee_id,
                time_in,
                time_out,
            });
  
            if (existingAttendance) {
                console.log(`Attendance for employee ${employee_id} on ${time_in} already exists. Updating hours...`);
                existingAttendance.total_hours = `${parseFloat(existingAttendance.total_hours || 0) + parseFloat(total_hours || 0)}h`;
                existingAttendance.overtime_hours = `${parseFloat(existingAttendance.overtime_hours || 0) + parseFloat(overtime_hours || 0)}h`;
                await existingAttendance.save();
                continue;
            }
  
            const newAttendance = new Attendance({
                employee_id,
                employee_firstname,
                employee_lastname,
                position,
                time_in,
                time_out,
                total_hours,
                overtime_hours,
                entry_type,
                batch_id: batchId,
                isHoliday,
            });
  
            await newAttendance.save();
        }
  
        res.status(200).json({ success: true, attendanceData });
    } catch (error) {
        console.error("Error fetching and saving data:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getLeavesAndAttendance = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        const leavesResponse = await axios.get(`${process.env.API_GATEWAY_URL}/hr1/get-approved-leaves`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });
        const leaveRecords = leavesResponse.data.data;

        for (const leave of leaveRecords) {
            const { employee_id, leave_id, leave_type, employee_firstname, employee_lastname } = leave;

            const existingLeave = await EmployeeLeave.findOne({ employee_id, "leaves.leave_id": leave_id });

            if (existingLeave) {
                console.log(`Leave ID ${leave_id} already exists. Skipping...`);
                continue;
            }

            let behavior = await EmployeeLeave.findOne({ employee_id });

            if (!behavior) {
                behavior = new EmployeeLeave({
                    employee_id,
                    employee_firstname,
                    employee_lastname,
                    leave_count: 0,
                    leave_types: {},
                    leaves: [],
                    isAlreadyAdded: false
                });
            }

            behavior.leave_count += 1;

            if (!behavior.leave_types[leave_type]) {
                behavior.leave_types[leave_type] = 0;
            }
            behavior.leave_types[leave_type] += 1;

            behavior.leaves.push({ leave_id, leave_type });

            await behavior.save();
        }

        const attendanceResponse = await axios.get(`${process.env.API_GATEWAY_URL}/hr1/get-time-tracking`, {
            headers: { Authorization: `Bearer ${serviceToken}` },
        });
        const attendanceData = attendanceResponse.data;
        const batchId = await generateBatchId();

        for (const record of attendanceData) {
            const { employee_id, employee_firstname, employee_lastname, position, time_in, time_out, total_hours, overtime_hours, entry_type, isHoliday } = record;

            const existingAttendance = await Attendance.findOne({
                employee_id,
                time_in,
                time_out,
            });

            if (existingAttendance) {
                console.log(`Attendance for employee ${employee_id} on ${time_in} already exists. Skipping...`);
                continue;
            }

            const newAttendance = new Attendance({
                employee_id,
                employee_firstname,
                employee_lastname,
                position,
                time_in,
                time_out,
                total_hours,
                overtime_hours,
                entry_type,
                batch_id: batchId,
                isHoliday,
            });

            await newAttendance.save();
        }

        res.status(200).json({ success: true, message: "Leaves and attendance data fetched and saved successfully." });
    } catch (error) {
        console.error("Error fetching and saving data:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
