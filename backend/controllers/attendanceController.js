import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { Batch } from '../models/batchModel.js';
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
            const { employee_id, leave_id, leave_type, employee_firstname, employee_lastname, start_date, end_date } = leave;
  
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
  
            behavior.leaves.push({ leave_id, leave_type, start_date, end_date }); 
  
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
            const { employee_id, leave_id, leave_type, employee_firstname, employee_lastname, start_date, end_date } = leave;

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

            behavior.leaves.push({ leave_id, leave_type, start_date, end_date });

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

export const getBehavioralAnalytics = async (req, res) => {
    try {
        const leaveData = await EmployeeLeave.find();
        const attendanceData = await Attendance.find();

        if (!leaveData || leaveData.length === 0) {
            return res.status(404).json({ message: "No leave data found" });
        }

        if (!attendanceData || attendanceData.length === 0) {
            return res.status(404).json({ message: "No attendance data found" });
        }

        const analytics = leaveData.map((leaveRecord) => {
            const employeeAttendance = attendanceData.filter(
                (attendance) => attendance.employee_id.toString() === leaveRecord.employee_id.toString()
            );

            const totalTimeIns = employeeAttendance.filter(record => record.time_in).length;

            const leaveDurations = leaveRecord.leaves.map(leave => {
                const startDate = new Date(leave.start_date);
                const endDate = new Date(leave.end_date);
                const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; 
                return {
                    leave_id: leave.leave_id,
                    leave_type: leave.leave_type,
                    durationInDays,
                };
            });

            return {
                employee_id: leaveRecord.employee_id,
                employee_name: `${leaveRecord.employee_firstname} ${leaveRecord.employee_lastname}`,
                leaveAnalytics: {
                    totalLeaves: leaveRecord.leave_count,
                    leaveTypes: leaveRecord.leave_types,
                    leaveDurations,
                },
                attendanceAnalytics: {
                    totalAttendanceRecords: employeeAttendance.length,
                    totalTimeIns,
                },
            };
        });

        res.status(200).json({
            success: true,
            analytics,
        });
    } catch (error) {
        console.error("Error fetching behavioral analytics:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const saveAttendance = async (req, res) => {
    try {
        const { employee_id, time_in, time_out, total_hours, batch_id, position } = req.body;

        const expected_time_in = new Date(time_in);
        expected_time_in.setHours(9, 0, 0, 0);

        let minutes_late = 0;
        if (time_in) {
            const diff = (new Date(time_in) - expected_time_in) / (1000 * 60); 
            minutes_late = diff > 0 ? Math.floor(diff) : 0;
        }

        const attendance = new Attendance({
            employee_id,
            time_in,
            time_out,
            total_hours,
            batch_id,
            position,
            minutes_late,
        });

        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
