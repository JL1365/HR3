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
// import EmployeeViolation from "./private/admin/EmployeeViolation";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route element={<PrivateLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/compensation-planning" element={<CompensationPlanning />} />
          <Route path="/compensation-benefit" element={<CompensationBenefit />} />
          <Route path="/penalty" element={<Penalty />} />
          {/* <Route path="/employee-violation" element={<EmployeeViolation />} /> */}
          
          <Route path="/benefit-request" element={<BenefitRequest />} />
          <Route path="/benefit-deductions" element={<BenefitDeduction />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
        <Route element={<PrivateLayout />}>
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/employee-login" replace />} />
    </Routes>
  );
}

export default App;
