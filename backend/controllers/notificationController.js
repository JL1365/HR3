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

        const notificationsWithElapsedTime = notifications.map(notification => {
            const elapsedTime = Math.floor((Date.now() - new Date(notification.createdAt).getTime()) / 1000);
            let timeElapsedText = `${elapsedTime} seconds ago`;
            if (elapsedTime >= 60) {
                const minutes = Math.floor(elapsedTime / 60);
                timeElapsedText = `${minutes} minutes ago`;
                if (minutes >= 60) {
                    const hours = Math.floor(minutes / 60);
                    timeElapsedText = `${hours} hours ago`;
                }
            }
            return { ...notification.toObject(), timeElapsed: timeElapsedText };
        });

        return res.status(200).json({ success: true, data: notificationsWithElapsedTime });
    } catch (error) {
        console.error("Error fetching notifications for user:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user && req.user.userId ? String(req.user.userId) : null;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error("Error marking notification as read:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
