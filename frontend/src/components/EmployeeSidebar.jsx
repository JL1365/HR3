import React, { useState, useEffect, forwardRef } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Plus,
  Gift,
  DollarSign,
} from "lucide-react";

import jjmLogo from "../assets/jjmlogo.jpg";

const EmployeeSidebar = forwardRef(({ isSidebarOpen }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = location.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSidebarOpen]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const menuItems = [
    { name: "Dashboard", href: "/Employee-dashboard", icon: LayoutDashboard },
    {
      name: "Compensation",
      icon: Briefcase,
      subItems: [{ name: "Salary Structure", href: "/my-salary-structure" },
        { name: "My violations", href: "/my-violations" }
      ],
    },
    {
      name: "My Benefits",
      icon: Plus,
      subItems: [
        {name: "Benefits Overview",href: "/benefits-overview"},
        { name: "Apply Benefit", href: "/apply-benefit" },
        { name: "My Deductions", href: "/my-deductions" },
      ],
    },
    {
      name: "My Incentives",
      icon: Gift,
      subItems: [
        {name: "Incentives Overview",href: "/overview"},
        {name: "Incentive History",href: "/incentive-history"},
      ],
    },
    {
      name: "My Salary info",
      icon: DollarSign,
       href: "/my-salary-info",
    },
  ];

  return (
    <div className="flex">
      <motion.div
        ref={ref}
        initial={{ width: 0 }}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        exit={{ width: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 overflow-hidden z-50"
      >
        <div className="p-6 h-full overflow-y-auto custom-scrollbar">
          <div className="flex items-center space-x-3 mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <img
                src={jjmLogo}
                alt="Admin Logo"
                className="w-12 h-12 rounded-lg shadow-md object-cover"
              />
              <div className="flex-1">
                <h1 className="font-bold text-gray-800 dark:text-white text-lg">
                  Employee
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    activePage === item.href
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() =>
                    item.subItems
                      ? toggleDropdown(index)
                      : handleNavigation(item.href)
                  }
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-sm ml-3">
                      {item.name}
                    </span>
                  </div>
                  {item.subItems &&
                    (openDropdown === index ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </div>

                <AnimatePresence>
                  {item.subItems && openDropdown === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-8 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.subItems.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          className={`flex items-center p-2 pl-6 rounded-lg transition-all duration-200 ${
                            activePage === subItem.href
                              ? "bg-blue-200 text-blue-600"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                          onClick={() => handleNavigation(subItem.href)}
                        >
                          <span className="text-sm">{subItem.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default EmployeeSidebar;
