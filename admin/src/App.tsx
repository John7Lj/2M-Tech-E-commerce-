import React, { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminRoute from './components/routes/AdminRoute';
import Loader from './components/common/Loader';
import { useGetMeQuery } from './redux/api/user.api';
import { userExists, userNotExists } from './redux/reducers/user.reducer';
import { AppDispatch, RootState } from './redux/store';

// Register Chart.js components
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AuthPage = lazy(() => import('./pages/AuthPage'));

// Admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminAddProduct = lazy(() => import('./components/admin/AddProduct/index'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminFeaturedProducts = lazy(() => import('./pages/admin/FeaturedProduct'));
const AdminManageProduct = lazy(() => import('./components/admin/ManageProduct'));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdmiOrderDetails'));
const CategoryManagement = lazy(() => import('./components/admin/CategoryManagement'));
const BrandManagement = lazy(() => import('./components/admin/BrandManagement'));
const SubCategoryManagement = lazy(() => import('./components/admin/SubcategoryManagement'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const CurrencyManagement = lazy(() => import('./components/admin/CurrencyManagement'));
const PageManagement = lazy(() => import('./components/admin/PageManagement'));
const SettingMangmet = lazy(() => import('./pages/admin/AdminSettings'));
const BannerManagement = lazy(() => import('./components/admin/BannerManagement'));
const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, error, isFetching } = useGetMeQuery();
    const { loading, user } = useSelector((state: RootState) => state.user);

    // Dispatch user status on data or error change
    useEffect(() => {
        if (data?.user) {
            dispatch(userExists(data.user));
        } else if (!isFetching) {
            // Only mark as not exists if we are NOT fetching
            // and maybe check if we have an admin_token (if we do, we might still be waiting for some reason)
            const token = localStorage.getItem('admin_token');
            if (error || (!data?.user && !token)) {
                dispatch(userNotExists());
            }
        }
    }, [data, error, isFetching, dispatch]);

    // Admin application route level guards (AdminRoute) handle the loading state
    // We don't block the entire tree to avoid unmounting the app during RTK Query refetches.

    return (
        <>
            <ToastContainer position="bottom-center" />
            <div className="flex flex-col min-h-screen">
                <Router>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            {/* Root route - redirect based on user status */}
                            <Route
                                path="/"
                                element={
                                    loading ? <Loader /> : (user && user.role === 'admin'
                                        ? <Navigate to="/admin/dashboard" replace />
                                        : <Navigate to="/auth" replace />)
                                }
                            />

                            {/* Auth route */}
                            <Route path="/auth" element={<AuthPage />} />

                            {/* Admin routes - FIXED */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin" element={<AdminLayout />}>
                                    {/* Default admin route should go to dashboard */}
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="featured" element={<AdminFeaturedProducts />} />
                                    <Route path="products/new" element={<AdminAddProduct />} />
                                    <Route path="products/:productId" element={<AdminManageProduct />} />
                                    <Route path="brands" element={<BrandManagement />} />
                                    <Route path="customers" element={<AdminCustomers />} />
                                    <Route path="transactions" element={<AdminTransactions />} />
                                    <Route path="coupons" element={<AdminCoupons />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                                    <Route path="categories" element={<CategoryManagement />} />
                                    <Route path="subcategories" element={<SubCategoryManagement />} />
                                    <Route path="currencies" element={<CurrencyManagement />} />
                                    <Route path="page" element={<PageManagement />} />
                                    <Route path="setting" element={<SettingMangmet />} />
                                    <Route path="banner" element={<BannerManagement />} />


                                </Route>
                            </Route>

                            {/* Fallback route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </Router>
            </div>
        </>
    );
};

export default App;
