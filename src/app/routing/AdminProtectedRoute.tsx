import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../../modules/Login/Hooks/useAuth';
import AdminDashboard from '../../modules/Dashboards/Pages/AdminDashboard';

export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    // Parent route already validated session; keep rendering without flashing redirects.
    return <AdminDashboard />;
  }

  const isAdmin = user?.roles?.some((role) =>
    typeof role === 'string' ? role === 'admin' : role?.name === 'admin'
  );

  if (!isAdmin) {
    return <Navigate to="/user" />;
  }

  return <AdminDashboard />;
}

