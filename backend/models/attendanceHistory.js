import mongoose from 'mongoose';

const attendanceHistorySchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employee_firstname: {
    type: String,
    required: true,
  },
  employee_lastname: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  time_in: {
    type: Date,
  },
  time_out: {
    type: Date,
  },
  total_hours: {
    type: String,
    required: true,
  },
  overtime_hours: {
    type: String,
    default: '0h 0m',
  },
  entry_type: {
    type: String,
    enum: ['Manual Entry', 'System Entry', 'N/A'],
  },
  batch_id: { 
    type: String,
    required: true,
  },
  isFinalized: { type: Boolean, default: false },
  isHoliday: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const AttendanceHistory = mongoose.model('AttendanceHistory', attendanceHistorySchema);
