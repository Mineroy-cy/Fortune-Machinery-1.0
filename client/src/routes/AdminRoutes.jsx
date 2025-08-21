import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RequireAdminAuth() {
  const { admin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return admin ? <Outlet /> : <Navigate to="/admin/login" />;
}
