import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./public/AdminLogin";
import EmployeeLogin from "./public/EmployeeLogin";

import AdminDashboard from "./private/admin/AdminDashboard";
import EmployeeDashboard from "./private/employee/EmployeeDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/employee-login" replace />} />
    </Routes>
  );
}

export default App;
