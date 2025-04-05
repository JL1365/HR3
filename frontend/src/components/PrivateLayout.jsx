import { Outlet, useLocation } from "react-router-dom";
import PrivateHeader from "./PrivateHeader";
import AdminSidebar from "./AdminSidebar";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect, useRef } from "react";
import EmployeeSidebar from "./EmployeeSidebar";

const PrivateLayout = () => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const { user } = useAuthStore();

  const pageTitles = {
    "/profile": "Profile",
    "/my-profile": "Profile",
    "/settings": "Setting",
    "/my-settings": "Setting",
    "/admin-dashboard": "DASHBOARD",
    "/compensation-planning": "Compensation planning",
    "/compensation-benefit": "Compensation benefit",
    "/grievance": "Grievance",
    "/penalty": "Penalties",
    "/employee-violation": "Employee violation",
    "/compensation-planning": "Compensation planning",

    "/incentive-overview": "Incentive overview",
    "/assign-incentive": "Assign incentive",

    "/attendance-overview": "Attendance",
    "/salary-computation": "Salary computation",
    "/budget-request": "Request a budget",

    "/my-salary-structure": "Salary structure",
    "/my-violations": "My Violations",

    "/benefit-request": "Benefit Requests",
    "/benefit-deductions": "Benefit Deductions",
    "/employee-benefit-details": "Employee Benefit Details",
    "/documents": "Documents",

    "/behavioral-analytics": "Behavioral Analytics",
    "/predictive-analytics": "Predictive Analytics",

    "/employee-dashboard": "DASHBOARD",
    "/benefits-overview": "Benefits Overview",
    "/apply-benefit": "Apply Benefit",
    "/my-deductions": "My Deductions",
    "/overview": "Incentives Overview",
    "/incentive-history": "Incentive History",

    "/my-salary-info": "Salary Info",
  };
  
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray">
      {user?.role === "admin" ? (
        <AdminSidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      ) : (
        <EmployeeSidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <div className={`flex-1 transition-all ${isSidebarOpen ? "md:ml-72 md:blur-none ml-0 blur-sm" : "ml-0"}`}>
        <PrivateHeader title={currentTitle} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="p-6 flex-grow">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default PrivateLayout;
