import mongoose from "mongoose";

const benefitRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    compensationBenefitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "CompensationBenefit",
    },
    uploadDocs: {
      frontId: { type: String},
      backId: { type: String},
    },
    status:{
      type:String,
      enum:["Approved","Denied","Pending"],
      default:"Pending"
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const BenefitRequest = mongoose.model("BenefitRequest",benefitRequestSchema);
