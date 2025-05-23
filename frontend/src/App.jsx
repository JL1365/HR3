import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./public/AdminLogin";
import EmployeeLogin from "./public/EmployeeLogin";

import AdminDashboard from "./private/admin/AdminDashboard";
import EmployeeDashboard from "./private/employee/EmployeeDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import PrivateLayout from "./components/PrivateLayout";

import CompensationPlanning from "./private/admin/CompensationPlanning";
import CompensationBenefit from "./private/admin/CompensationBenefit";
import Penalty from "./private/admin/Penalty";
import BenefitRequest from "./private/admin/BenefitRequest";
import BenefitDeduction from "./private/admin/BenefitDeductions";
import EmployeeBenefitDetails from "./private/admin/EmployeeBenefitDetails";
import Documents from "./private/admin/Documents";
import IncentiveOverview from "./private/admin/IncentiveOverview";
import IncentiveTracking from "./private/admin/IncentiveTracking";
import Attendance from "./private/admin/Attendance";
import SalaryComputation from "./private/admin/SalaryComputation";
import BudgetRequest from "./private/admin/BudgetRequest";
import BehavioralAnalytics from "./private/admin/BehavioralAnalytics";
import BenefitsOverview from "./private/employee/BenefitsOverview";
import ApplyBenefit from "./private/employee/ApplyBenefit";
import MyDeductions from "./private/employee/MyDeductions";

import IncentivesOverview from "./private/employee/IncentivesOverview";
import IncentiveHistory from "./private/employee/IncentiveHistory";
import MySalaryInfo from "./private/employee/MySalaryInfo";
import EmployeeViolation from "./private/admin/EmployeeViolation";
import MyViolations from "./private/employee/MyViolation";
import MySalaryStructure from "./private/employee/MySalaryStructure";
import Grievance from "./private/admin/Grievance";
import Audit from "./private/admin/Audit";
import EmployeeBehaviorPredictor from "./private/admin/PredictiveAnalytics";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import VerifyOtp from "./components/VerifyOtp";
// import EmployeeViolation from "./private/admin/EmployeeViolation";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<PrivateLayout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/compensation-planning" element={<CompensationPlanning />} />
          <Route path="/compensation" element={<CompensationBenefit />} />
          <Route path="/grievance" element={<Grievance />} />
          <Route path="/penalty" element={<Penalty />} />
          <Route path="/employee-violation" element={<EmployeeViolation />} />
          
          <Route path="/benefit-request" element={<BenefitRequest />} />
          <Route path="/benefit-deductions" element={<BenefitDeduction />} />
          <Route path="/employee-benefit-details" element={<EmployeeBenefitDetails />} />
          <Route path="/documents" element={<Documents />} />
          
          <Route path="/incentive-overview" element={<IncentiveOverview />} />
          <Route path="/assign-incentive" element={<IncentiveTracking />} />

          <Route path="/attendance-overview" element={<Attendance />} />
          <Route path="/salary-computation" element={<SalaryComputation />} />
          <Route path="/budget-request" element={<BudgetRequest />} />

          <Route path="/behavioral-analytics" element={<BehavioralAnalytics />} />
          <Route path="/predictive-analytics" element={<EmployeeBehaviorPredictor />} />

          <Route path="/audit" element={<Audit />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
        <Route element={<PrivateLayout />}>
        <Route path="/my-profile" element={<Profile />} />
        <Route path="/my-settings" element={<Settings />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/my-salary-structure" element={<MySalaryStructure />} />
          <Route path="/my-violations" element={<MyViolations />} />
          <Route path="/benefits-overview" element={<BenefitsOverview />} />
          <Route path="/apply-benefit" element={<ApplyBenefit />} />
          <Route path="/my-deductions" element={<MyDeductions />} />

          <Route path="/overview" element={<IncentivesOverview />} />
          <Route path="/incentive-history" element={<IncentiveHistory />} />

          <Route path="/my-salary-info" element={<MySalaryInfo />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/employee-login" replace />} />
    </Routes>
  );
}

export default App;
