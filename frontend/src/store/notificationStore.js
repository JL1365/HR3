import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useNotificationStore = create((set) => ({
  notifications: [],
  fetchNotifications: async () => {
    try {
      const response = await axiosInstance.get("/notification/get-notifications-by-role");
      set({ notifications: response.data.data });
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  },
  markAsRead: async (notificationId) => {
    try {
      await axiosInstance.put(`/notification/mark-as-read/${notificationId}`);
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  },
}));
