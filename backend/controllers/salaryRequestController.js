import axios from "axios";
import { generateServiceToken } from "../middlewares/gatewayTokenGenerator.js";
import { Attendance } from "../models/attendanceModel.js";
import { CompensationPlanning } from "../models/compensationPlanningModel.js";
import { BenefitDeduction } from "../models/benefitDeductionModel.js";
import { IncentiveTracking } from "../models/incentiveTrackingModel.js";
import { EmployeeCompensation } from "../models/employeeCompensationModel.js";
import { CompensationBenefit } from "../models/compensationBenefitModel.js";

const calculateGrossPayroll = async () => {
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

    return Object.entries(payrollByBatch).map(([batchId, employees]) => ({
        batch_id: batchId,
        employees: Object.values(employees).map(employee => ({
            ...employee,
            grossSalary: ((employee.totalWorkHours * employee.hourlyRate) + 
                         (employee.totalOvertimeHours * employee.overtimeRate)).toFixed(2)
        }))
    }));
};

export const calculateGrossSalary = async (req, res) => {
    try {
        const payrollData = await calculateGrossPayroll();
        res.status(200).json({ success: true, data: payrollData });
    } catch (error) {
        console.error(`Error in calculating payroll: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const calculateNetSalary = async (req, res) => {
    try {
        const serviceToken = generateServiceToken();

        let payrollData = [];
        try {
            payrollData = await calculateGrossPayroll();
        } catch (error) {
            console.warn("No attendance data found, proceeding with deductions, incentives, and paid leaves only.");
        }

        const deductions = await BenefitDeduction.find({ isAlreadyAdded: false });
        const approvedIncentives = await IncentiveTracking.find({ isAlreadyAdded: false });
        const employeeCompensations = await EmployeeCompensation.find({ isAlreadyAdded: false });

        const deductionsMap = {};
        deductions.forEach(deduction => {
            const key = `${deduction.userId}`;
            deductionsMap[key] = (deductionsMap[key] || 0) + deduction.amount;
        });

        const incentivesMap = {};
        approvedIncentives.forEach(incentive => {
            const key = `${incentive.userId}`;
            incentivesMap[key] = (incentivesMap[key] || 0) + incentive.amount;
        });

        const compensationMap = {};
        employeeCompensations.forEach(compensation => {
            const key = `${compensation.employeeId}`;
            if (!compensationMap[key]) {
                compensationMap[key] = { paidLeaveAmount: 0, deductibleAmount: 0 };
            }
            if (compensation.benefitType === "Paid Benefit") {
                compensationMap[key].paidLeaveAmount += compensation.totalAmount || 0;
            } else if (compensation.benefitType === "Deductible Benefit") {
                compensationMap[key].deductibleAmount += compensation.deductionAmount || 0;
            }
        });

        if (payrollData.length === 0) {
            const employeeIds = new Set([
                ...Object.keys(deductionsMap),
                ...Object.keys(incentivesMap),
                ...Object.keys(compensationMap),
            ]);

            payrollData = Array.from(employeeIds).map(employeeId => ({
                batch_id: "N/A",
                employees: [{
                    employee_id: employeeId,
                    employee_firstname: "Unknown",
                    employee_lastname: "Unknown",
                    position: "Unknown",
                    totalWorkHours: 0,
                    totalOvertimeHours: 0,
                    dailyWorkHours: [],
                    dailyOvertimeHours: [],
                    hourlyRate: 0,
                    overtimeRate: 0,
                    holidayRate: 0,
                    holidayCount: 0,
                    grossSalary: "0.00",
                    benefitsDeductionsAmount: deductionsMap[employeeId] || 0,
                    incentiveAmount: incentivesMap[employeeId] || 0,
                    paidLeaveAmount: compensationMap[employeeId]?.paidLeaveAmount || 0,
                    deductibleAmount: compensationMap[employeeId]?.deductibleAmount || 0,
                    netSalary: (
                        (incentivesMap[employeeId] || 0) +
                        (compensationMap[employeeId]?.paidLeaveAmount || 0) -
                        (deductionsMap[employeeId] || 0) -
                        (compensationMap[employeeId]?.deductibleAmount || 0)
                    ).toFixed(2),
                }]
            }));
        } else {
            payrollData = payrollData.map(batch => {
                let totalNetSalary = 0;

                const employees = batch.employees.map(employee => {
                    if (!employee || !employee.employee_id) return null;

                    const key = `${employee.employee_id}`;
                    const benefitsDeductionsAmount = deductionsMap[key] || 0;
                    const incentiveAmount = incentivesMap[key] || 0;
                    const paidLeaveAmount = compensationMap[key]?.paidLeaveAmount || 0;
                    const deductibleAmount = compensationMap[key]?.deductibleAmount || 0;
                    const grossSalary = parseFloat(employee.grossSalary) || 0;
                    const netSalary = (
                        grossSalary +
                        incentiveAmount +
                        paidLeaveAmount -
                        benefitsDeductionsAmount -
                        deductibleAmount
                    ).toFixed(2);

                    totalNetSalary += parseFloat(netSalary);

                    return {
                        ...employee,
                        benefitsDeductionsAmount,
                        incentiveAmount,
                        paidLeaveAmount,
                        deductibleAmount,
                        netSalary
                    };
                }).filter(emp => emp !== null);

                return {
                    batch_id: batch.batch_id,
                    totalNetSalary: totalNetSalary.toFixed(2),
                    employees
                };
            });
        }

        res.status(200).json({ success: true, data: payrollData });
    } catch (error) {
        console.error(`Error in fetching payroll with deductions and incentives: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const addEmployeeCompensation = async (req, res) => {
    try {
        const { employeeId, benefit, benefitType, daysLeave } = req.body;

        if (!employeeId || !benefit || !benefitType) {
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
        const userExists = users.find(user => user._id === employeeId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const benefitDetails = await CompensationBenefit.findById(benefit);
        if (!benefitDetails) {
            return res.status(404).json({ message: "Benefit not found." });
        }

        if (benefitDetails.benefitType !== benefitType) {
            return res.status(400).json({ message: "Benefit type mismatch." });
        }

        const compensationData = {
            employeeId,
            benefit,
            benefitType,
            isAlreadyAdded: false
        };

        if (benefitType === "Paid Benefit") {
            if (!daysLeave || daysLeave <= 0) {
                return res.status(400).json({ message: "Days of leave must be greater than 0." });
            }
            compensationData.daysLeave = daysLeave;
            compensationData.totalAmount = daysLeave * benefitDetails.benefitAmount;
        } else if (benefitType === "Deductible Benefit") {
            compensationData.deductionAmount = benefitDetails.benefitAmount;
            delete compensationData.daysLeave;
        } else {
            return res.status(400).json({ message: "Invalid benefit type." });
        }

        const newCompensation = new EmployeeCompensation(compensationData);
        await newCompensation.save();

        res.status(201).json({ message: "Employee compensation added successfully.", data: newCompensation });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};