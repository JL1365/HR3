import mongoose from "mongoose";

const DailyHoursSchema = new mongoose.Schema({
  hours: { type: Number, required: true },
  date: { type: Date, required: true },
  isHoliday: { type: Boolean, default: false }
}, { _id: false });

const PayrollHistorySchema = new mongoose.Schema({
    batch_id: { type: String, required: true },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employee_firstname: { type: String, required: true },
    employee_lastname: { type: String, required: true },
    position: { type: String, required: true },
    totalWorkHours: { type: Number, required: true },
    totalOvertimeHours: { type: Number, required: true },
    dailyWorkHours: { type: [DailyHoursSchema] },
    dailyOvertimeHours: { type: [DailyHoursSchema] },
    hourlyRate: { type: Number, required: true },
    overtimeRate: { type: Number, required: true },
    holidayRate: { type: Number, required: true },
    holidayCount: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    benefitsDeductionsAmount: { type: Number, default: 0 },
    incentiveAmount: { type: Number, default: 0 },
    paidLeaveAmount: { type: Number, default: 0 },
    deductibleAmount: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    payroll_date: { type: Date, default: Date.now }
});

export const PayrollHistory = mongoose.model("PayrollHistory", PayrollHistorySchema);