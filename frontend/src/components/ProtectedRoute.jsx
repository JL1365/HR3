import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    fetchAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/employee-login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
