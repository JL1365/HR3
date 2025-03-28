import { Search, User, Bell, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import io from "socket.io-client";

const socketURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:7687"
    : window.location.origin;

const socket = io(socketURL, { withCredentials: true });

const PrivateHeader = ({ title, toggleSidebar, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, addRealTimeNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notifRef.current && !notifRef.current.contains(event.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("deductionAdded", (data) => {
      console.log("Real-time deduction notification:", data);
      addRealTimeNotification({
        _id: Date.now(), // Temporary unique ID for real-time notifications
        message: data.message,
        read: false,
        timeElapsed: "Just now",
      });
    });

    socket.on("incentiveAssigned", (data) => {
      console.log("Real-time incentive notification:", data);
      addRealTimeNotification({
        _id: Date.now(), // Temporary unique ID for real-time notifications
        message: data.message,
        read: false,
        timeElapsed: "Just now",
      });
    });

    socket.on("requestStatusUpdated", (data) => {
      console.log("Real-time request status update:", data);
      addRealTimeNotification({
        _id: Date.now(), // Temporary unique ID for real-time notifications
        message: data.message,
        read: false,
        timeElapsed: "Just now",
      });
    });

    socket.on("payrollFinalized", (data) => {
      console.log("Real-time payroll finalized notification:", data);
      addRealTimeNotification({
        _id: Date.now(), // Temporary unique ID for real-time notifications
        message: data.message,
        read: false,
        timeElapsed: "Just now",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("deductionAdded");
      socket.off("incentiveAssigned");
      socket.off("requestStatusUpdated");
      socket.off("payrollFinalized");
    };
  }, [socket, addRealTimeNotification]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    const redirectPath = user?.role === "Admin" ? "/admin-login" : "/employee-login";

    logout();
    navigate(redirectPath);
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  return (
    <header className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg border border-black mb-10 z-50 relative">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-gray-300 hover:bg-gray-300 rounded-md"
          >
            {isSidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
          <h1 className="text-2xl font-semibold text-black">{title}</h1>
        </div>

        <div className="relative hidden md:block w-1/3">
          <Search size={20} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="md:hidden p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <Search size={20} className="text-gray-600" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <Bell size={24} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-300 z-50">
                <ul className="py-2 text-sm text-gray-700 max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        notification.read ? "text-gray-500" : "text-black"
                      }`}
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <div>{notification.message}</div>
                      <div className="text-xs text-gray-400">{notification.timeElapsed}</div>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-4 py-2 text-gray-500">No notifications</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <User size={24} className="text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-300 z-50">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to={user?.role === "Admin" ? "/profile" : "/my-profile"}>Profile</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <a href="/settings">Settings</a>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600" onClick={handleLogout}>Log Out</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="md:hidden px-4 py-2">
          <div className="relative w-full">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default PrivateHeader;