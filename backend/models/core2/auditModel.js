import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    task: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const Audit = mongoose.model('Audit', auditSchema);
