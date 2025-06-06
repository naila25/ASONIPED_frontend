import { Navigate, Outlet } from '@tanstack/react-router';
import { isAuthenticated } from "../Utils/auth";

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;