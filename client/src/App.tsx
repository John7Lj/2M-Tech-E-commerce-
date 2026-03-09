// client/src/App.tsx - Updated with banner route
import React, { Suspense, lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import ScrollToTop from './components/common/ScrollToTop';

import Loader from './components/common/Loader';
import { useGetMeQuery } from './redux/api/user.api';
import { userExists, userNotExists } from './redux/reducers/user.reducer';
import { AppDispatch } from './redux/store';
import DynamicPage from './pages/DynamicPage';
import { useMetadata } from './hooks/useMetadata';

// Register Chart.js components
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Lazy load components (your existing imports)
const HomePage = lazy(() => import('./pages/HomePage'));
const Layout = lazy(() => import('./components/layout/Layout'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CheckoutForm = lazy(() => import('./components/CheckoutForm'));
const Shipping = lazy(() => import('./pages/Shipping'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const BannerPage = lazy(() => import('./pages/BannerPage')); // Add Banner Page

// Add Analytics Dashboard
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, error } = useGetMeQuery();
    useMetadata();

    // Dispatch user status on data or error change
    useEffect(() => {
        if (data?.user) {
            dispatch(userExists(data.user));
        } else if (error) {
            dispatch(userNotExists());
        }
    }, [data, error, dispatch]);
    // Ensure we don't block the screen entirely while checking user authentication.
    // The specific route guards (ProtectedRoute, PublicRoute) will handle loader display.

    return (
        <>
            <ToastContainer position="bottom-center" />
            <div className="flex flex-col min-h-screen">
                <Router>
                    <ScrollToTop />
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<HomePage />} />
                                <Route path="products" element={<ProductsPage />} />
                                <Route path="product/:productId" element={<ProductDetails />} />
                                <Route path="category/:categorySlug" element={<CategoryPage />} />
                                <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                                <Route path="banner/:bannerId" element={<BannerPage />} /> {/* Add Banner Route */}

                                {/* Dynamic pages from database - Generic route */}
                                <Route path="/pages/:slug" element={<DynamicPage />} />

                                <Route path="search" element={<SearchPage />} />
                            </Route>

                            {/* Public routes */}
                            <Route element={<PublicRoute />}>
                                <Route path="auth" element={<AuthPage />} />
                            </Route>

                            {/* Protected routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<Layout />}>
                                    <Route path="cart" element={<CartPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="my-orders" element={<MyOrders />} />
                                    <Route path="/order/:id" element={<OrderDetails />} />

                                    <Route path="shipping" element={<Shipping />} />
                                    <Route path="checkout" element={<CheckoutForm />} />
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