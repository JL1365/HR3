import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { Batch } from '../models/batchModel.js';
import { EmployeeLeave } from "../models/employeeLeaveModel.js";
import { Attendance } from "../models/attendanceModel.js";
import { AttendanceHistory } from "../models/attendanceHistory.js";

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

        const usersResponse = await axios.get(
            `${process.env.API_GATEWAY_URL}/admin/get-accounts`,
            {
                headers: { Authorization: `Bearer ${serviceToken}` },
            }
        );
        const users = usersResponse.data.filter(user => user.role === "Employee");

        const batchId = await generateBatchId();

        for (const user of users) {
            const { _id: employee_id, firstName, lastName, position } = user;

            const existingAttendance = await Attendance.findOne({ employee_id });
            if (existingAttendance) {
                console.log(`Attendance for employee ID ${employee_id} already exists. Skipping...`);
                continue;
            }

            const newAttendance = new Attendance({
                employee_id,
                employee_firstname: firstName || "N/A",
                employee_lastname: lastName || "N/A",
                position: position || "N/A",
                time_in: null,
                time_out: null,
                total_hours: "N/A",
                overtime_hours: "N/A",
                entry_type: "N/A",
                batch_id: batchId,
                isFinalized: false,
                isHoliday: false,
            });

            await newAttendance.save();
        }

        const finalizedRecords = await Attendance.find({ isFinalized: true });
        for (const record of finalizedRecords) {
            const historyRecord = new AttendanceHistory(record.toObject());
            await historyRecord.save();
            await Attendance.deleteOne({ _id: record._id });
        }

        res.status(200).json({ success: true, message: "Attendance processed successfully." });
    } catch (error) {
        console.error("Error fetching and saving attendance:", error.message);
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
            const { _id } = record;

            const existingAttendanceById = await Attendance.findOne({ _id });
            if (existingAttendanceById) {
                console.log(`Attendance with ID ${_id} already exists. Skipping...`);
                continue;
            }

            const newAttendance = new Attendance({
                ...record,
                batch_id: batchId,
            });

            await newAttendance.save();
        }

        res.status(200).json({ success: true, message: "Leaves and attendance data fetched and saved successfully." });
    } catch (error) {
        console.error("Error fetching and saving data:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
