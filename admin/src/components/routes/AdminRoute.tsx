import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Loader from '../common/Loader';

const AdminRoute: React.FC = () => {
    const { user, loading } = useSelector((state: RootState) => state.user);

    if (loading) return <Loader />;

    // If user is admin, render the protected routes
    // If not, redirect to auth page
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default AdminRoute;