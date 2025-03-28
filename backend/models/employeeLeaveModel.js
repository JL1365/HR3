import mongoose from "mongoose";

const employeeLeaveSchema = new mongoose.Schema({
    employee_id: { type: String, required: true, unique: true },
    employee_firstname: { type: String },
    employee_lastname: { type: String },
    leave_count: { type: Number, default: 0 },
    leave_types: { 
        type: Map, 
        of: Number, 
        default: {}, 
        validate: {
            validator: function (v) {
                return Object.values(v).every(value => Number.isInteger(value) && value >= 0);
            },
            message: props => `Leave types must contain non-negative integers!`
        }
    },
    leaves: [
        {
            leave_id: { type: String, required: true }, 
            leave_type: { type: String, required: true },
            start_date: { type: Date, required: true },
            end_date: { type: Date, required: true },
            isAlreadyAdded: { type: Boolean, default: false }
        }
    ],
    isAlreadyAdded: { type: Boolean, default: false }
});

export const EmployeeLeave = mongoose.model("EmployeeLeave", employeeLeaveSchema);
