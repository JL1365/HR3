import mongoose from "mongoose";

const employeeCompensationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    benefit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompensationBenefit", 
        required: true
    },
    benefitType: {
        type: String,
        enum: ["Paid Benefit", "Deductible Benefit","Deduction"],
        required: true
    },
    daysLeave: { 
        type: Number, 
        default: 0 
    },
    deductionAmount: { 
        type: Number 
    },
    totalAmount: { 
        type: Number, 
        default: 0 
    },
    isAlreadyAdded: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export const EmployeeCompensation = mongoose.model("EmployeeCompensation", employeeCompensationSchema);
