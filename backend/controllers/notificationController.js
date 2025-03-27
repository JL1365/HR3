import { Notification } from "../models/notificationModel.js";

export const getNotificationsByRole = async (req, res) => {
    try {
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const notifications = await Notification.find({
            userId: userId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error("Error fetching notifications for user:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
