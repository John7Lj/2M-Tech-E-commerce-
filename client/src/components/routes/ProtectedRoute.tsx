import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Loader from '../common/Loader';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useSelector((state: RootState) => state.user);

    if (loading) return <Loader />;

    return user ? <Outlet /> : <Navigate to="/auth" />;
};

export default ProtectedRoute;