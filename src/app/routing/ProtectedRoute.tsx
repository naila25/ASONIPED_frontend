import { Navigate, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { isAuthenticated } from "../../modules/Login/Services/auth";
import { authenticatedRequest } from "../../shared/Services/api.service";

const ProtectedRoute = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // First check if we have a token locally
        if (!isAuthenticated()) {
          setIsValidSession(false);
          setIsValidating(false);
          return;
        }

        // Make a test API call to validate the session
        try {
          const response = await authenticatedRequest('/users/validate-session', {
            method: 'POST'
          });

          if (response.ok) {
            setIsValidSession(true);
          } else {
            // Session is invalid, user will be redirected by apiRequest
            setIsValidSession(false);
          }
        } catch {
          // No token available or other error
          setIsValidSession(false);
        }
      } catch {
        setIsValidSession(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  // Show children immediately while validating in background
  // This prevents the loading flash and provides seamless UX
  if (isValidating) {
    return <Outlet />;
  }

  // Redirect to login if session is invalid
  if (!isValidSession) {
    return <Navigate to="/admin/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;