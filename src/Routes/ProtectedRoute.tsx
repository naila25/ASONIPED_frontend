import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { isLoggedIn } from "../Utils/auth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

export default ProtectedRoute; 