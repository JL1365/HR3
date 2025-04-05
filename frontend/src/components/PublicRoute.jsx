import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

const PublicRoute = () => {
  const { isAuthenticated, checkAuth, user } = useAuthStore();
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
  
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin-dashboard" : "/employee-dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicRoute;
