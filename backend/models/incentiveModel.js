import mongoose from "mongoose";

const incentiveSchema = new mongoose.Schema({
    incentiveName: {
        type: String,
        required: true,
        unique: true
    },
    incentiveDescription: {
        type: String,
        required: true,
    },
    incentiveType: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Incentive = mongoose.model("Incentive", incentiveSchema);
