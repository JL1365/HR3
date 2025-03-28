import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: String,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // createdAt and updatedAt fields are automatically added

export const Notification = mongoose.model('Notification', NotificationSchema);
