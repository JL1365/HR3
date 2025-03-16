import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { Attendance } from "../models/attendanceModel.js";
import { CompensationPlanning } from "../models/compensationPlanningModel.js";

export const calculateGrossSalary = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        const attendanceData = await Attendance.find({ isFinalized: { $ne: true } });

        const compensationPlans = await CompensationPlanning.find();

        const response = await axios.get(`${process.env.API_GATEWAY_URL}/admin/get-accounts`, {
            headers: { Authorization: `Bearer ${serviceToken}` }
        });

        const users = response.data;
        const positionMap = {};
        users.forEach(user => {
            positionMap[user._id] = user.position;
        });

        const formattedPlans = compensationPlans.map(plan => ({
            ...plan._doc,
            positionName: positionMap[plan.position] || "Unknown Position"
        }));

        const compensationMap = {};
        formattedPlans.forEach(plan => {
            compensationMap[plan.positionName] = plan;
        });

        const defaultHourlyRate = 110;
        const defaultOvertimeRate = 75;
        const defaultHolidayRate = 3;

        const payrollByBatch = {};

        attendanceData.forEach(attendance => {
            const batchId = attendance.batch_id;
            const employeeId = attendance.employee_id.toString();
            const positionName = attendance.position || "Unknown Position";
            const compensation = compensationMap[positionName];

            const hourlyRate = compensation ? compensation.hourlyRate || defaultHourlyRate : defaultHourlyRate;
            const overtimeRate = compensation ? compensation.overTimeRate || defaultOvertimeRate : defaultOvertimeRate;
            const holidayRate = compensation ? compensation.holidayRate || defaultHolidayRate : defaultHolidayRate;

            let totalHours = 0, totalMinutes = 0;
            if (attendance.total_hours) {
                const matches = attendance.total_hours.match(/(\d+)h\s*(\d+)?/);
                totalHours = matches ? parseInt(matches[1], 10) || 0 : 0;
                totalMinutes = matches && matches[2] ? parseInt(matches[2], 10) || 0 : 0;
            }

            let overtimeHours = 0, overtimeMinutes = 0;
            if (attendance.overtime_hours) {
                const matches = attendance.overtime_hours.match(/(\d+)h\s*(\d+)?/);
                overtimeHours = matches ? parseInt(matches[1], 10) || 0 : 0;
                overtimeMinutes = matches && matches[2] ? parseInt(matches[2], 10) || 0 : 0;
            }

            let dailyWorkHours = totalHours + (totalMinutes / 60);
            let dailyOvertimeHours = overtimeHours + (overtimeMinutes / 60);

            const isHoliday = attendance.holidayCount > 0;

            if (isHoliday) {
                dailyWorkHours *= holidayRate;
                dailyOvertimeHours *= 1.30; 
            } else {
                dailyOvertimeHours *= 1.25;
            }

            if (!payrollByBatch[batchId]) {
                payrollByBatch[batchId] = {};
            }

            if (!payrollByBatch[batchId][employeeId]) {
                payrollByBatch[batchId][employeeId] = {
                    employee_id: attendance.employee_id,
                    employee_firstname: attendance.employee_firstname,
                    employee_lastname: attendance.employee_lastname,
                    position: positionName,
                    dailyWorkHours: [{ hours: dailyWorkHours, date: attendance.createdAt, isHoliday }], 
                    dailyOvertimeHours: [{ hours: dailyOvertimeHours, date: attendance.createdAt, isHoliday }],
                    totalWorkHours: dailyWorkHours,
                    totalOvertimeHours: dailyOvertimeHours,
                    hourlyRate,
                    overtimeRate,
                    holidayRate,
                    holidayCount: attendance.holidayCount
                };
            } else {
                payrollByBatch[batchId][employeeId].dailyWorkHours.push({ hours: dailyWorkHours, date: attendance.createdAt, isHoliday });
                payrollByBatch[batchId][employeeId].dailyOvertimeHours.push({ hours: dailyOvertimeHours, date: attendance.createdAt, isHoliday });
                payrollByBatch[batchId][employeeId].totalWorkHours += dailyWorkHours;
                payrollByBatch[batchId][employeeId].totalOvertimeHours += dailyOvertimeHours;
                payrollByBatch[batchId][employeeId].holidayCount += attendance.holidayCount;
            }
        });

        const payrollData = Object.entries(payrollByBatch).map(([batchId, employees]) => ({
            batch_id: batchId,
            employees: Object.values(employees).map(employee => ({
                ...employee,
                grossSalary: ((employee.totalWorkHours * employee.hourlyRate) + 
                             (employee.totalOvertimeHours * employee.overtimeRate)).toFixed(2)
            }))
        }));

        res.status(200).json({ success: true, data: payrollData });
    } catch (error) {
        console.error(`Error in calculating payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
