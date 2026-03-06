import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const PublicRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return user ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
