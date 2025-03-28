import mongoose from "mongoose";

const mfaSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    email: { type: String, required: true },
    multiFactorEnabled: { type: Boolean, required: true },
    otp: { type: String },
    otpExpiration: { type: Date },
    updatedAt: { type: Date, default: Date.now },
});

export const MFA = mongoose.model("MFA", mfaSchema);