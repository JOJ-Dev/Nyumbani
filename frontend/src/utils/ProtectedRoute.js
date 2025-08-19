import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const LandlordRoute = () => {
  const { user } = useContext(AuthContext);
  return user?.landlord ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export const TenantRoute = () => {
  const { user } = useContext(AuthContext);
  return user?.tenant ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};