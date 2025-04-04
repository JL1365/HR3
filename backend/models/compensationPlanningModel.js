import mongoose from "mongoose";

const compensationPlanningSchema = new mongoose.Schema({
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    overTimeRate: {
        type: Number,
        required: true
    },
    holidayRate: {
        type: Number,
        required: true
    },
    benefits: [{
        benefitType: { type: String, required: true },  
        deductionsAmount: { type: Number, required: true }
    }],
}, { timestamps: true });

export const CompensationPlanning = mongoose.model("CompensationPlanning", compensationPlanningSchema);
