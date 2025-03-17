import { Search, User, Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PrivateHeader = ({ title, toggleSidebar, isSidebarOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    logout();
    navigate("/employee-login");
  };

  return (
    <header className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg border border-black mb-10">
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

          <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none">
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <User size={24} className="text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-300 z-10">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
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