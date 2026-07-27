import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth() {
  const { agent } = useAuth();
  if (!agent) return <Navigate to="/login" replace />;
  return <Outlet />;
}
