import { Attendance } from "../models/attendanceModel.js";
import { EmployeeLeave } from "../models/employeeLeaveModel.js";


export const predictEmployeeBehavior = async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({});
    const predictions = [];

    for (const employee of employees) {
      const attendanceRecords = await Attendance.find({ employee_id: employee.employee_id });

      const holidayAttendance = attendanceRecords.filter(record => record.isHoliday === true);
      const totalAttendance = attendanceRecords.length;

      const leaveTypesUsed = employee.leaves.map(leave => leave.leave_type);

      const frequentLeave = employee.leave_count > 5;
      const diverseLeaveTypes = leaveTypesUsed.length > 3;
      const oftenWorksHolidays = holidayAttendance.length > 3;

      let prediction = '';

      if (frequentLeave && !oftenWorksHolidays) {
        prediction = 'High leave frequency, low holiday work — Potential absenteeism';
      } else if (!frequentLeave && oftenWorksHolidays) {
        prediction = 'Low leave usage, high holiday work — Highly engaged';
      } else if (frequentLeave && oftenWorksHolidays) {
        prediction = 'Balanced: Takes leaves but still works on holidays';
      } else {
        prediction = 'Stable behavior';
      }

      predictions.push({
        employee_id: employee.employee_id,
        name: `${employee.employee_firstname} ${employee.employee_lastname}`,
        totalLeaves: employee.leave_count,
        leaveTypesUsed, 
        holidaysWorked: holidayAttendance.length,
        totalAttendance,
        prediction
      });
    }

    res.status(200).json({ success: true, predictions });
  } catch (err) {
    console.error("Error in predictive analysis:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const predictIncentiveEligibility = async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({});
    const incentivePredictions = [];

    for (const employee of employees) {
      const attendanceRecords = await Attendance.find({ employee_id: employee.employee_id });

      const totalAttendance = attendanceRecords.length;
      const totalLeaves = employee.leave_count;
      const holidaysWorked = attendanceRecords.filter(record => record.isHoliday === true).length;

      const isEligible = totalAttendance > 200 && holidaysWorked > 10 && totalLeaves < 5;

      incentivePredictions.push({
        employee_id: employee.employee_id,
        name: `${employee.employee_firstname} ${employee.employee_lastname}`,
        totalAttendance,
        holidaysWorked,
        totalLeaves,
        isEligible
      });
    }

    res.status(200).json({ success: true, incentivePredictions });
  } catch (err) {
    console.error("Error in incentive prediction:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
