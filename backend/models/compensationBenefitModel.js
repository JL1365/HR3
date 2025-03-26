import mongoose from "mongoose";

const compensationBenefitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    benefitName: {
        type: String,
        required: true
    },
    benefitType: {
        type: String,
        enum: ["Paid Benefit", "Deductible Benefit","Deduction"],
        required: true
    },
    benefitAmount: {
        type: Number,
        required: true
    },
    isNeedRequest:{
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const CompensationBenefit = mongoose.model("CompensationBenefit", compensationBenefitSchema);
