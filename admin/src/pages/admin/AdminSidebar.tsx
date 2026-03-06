import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import {
  FaBox,
  FaSignOutAlt,
  FaUsers,
  FaChevronRight,
  FaTags,
  FaThLarge,
  FaListAlt,
  FaTicketAlt,
  FaSitemap,
  FaLayerGroup,
  FaAtom,
  FaSellcast,
  FaBullhorn,
  FaDollarSign,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { useLogoutUserMutation } from '../../redux/api/user.api';
import { userNotExists } from '../../redux/reducers/user.reducer';
import { useConstants } from '../../hooks/useConstants';
import { notify } from '../../utils/util';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const { constants } = useConstants();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutUserMutation();

  const toggleProductsMenu = () => setIsProductsOpen(!isProductsOpen);

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      await logout().unwrap();
      dispatch(userNotExists());
      localStorage.removeItem('admin_token');
      notify('Logout successful', 'success');
      navigate('/auth');
    } catch (error: any) {
      notify(error?.data?.message || 'Logout failed', 'error');
    }
  };

  const isProductRouteActive = location.pathname.includes('/admin/products') ||
    location.pathname.includes('/admin/featured');

  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <React.Fragment key="admin-sidebar-fragment">
          {/* Overlay - Framer Motion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={toggleSidebar}
          />

          {/* Sidebar - Framer Motion Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-[70] flex flex-col border-r border-gray-100 dark:border-gray-800"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-3 group"
                onClick={() => toggleSidebar()}
              >
                <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={constants.logo}
                    alt="Logo"
                    className="w-9 h-9 object-contain rounded-lg"
                    onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                    {constants.companyName}
                  </span>
                  <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">
                    Admin Panel
                  </span>
                </div>
              </Link>

              <button
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-primary transition-all hover:bg-primary/5"
                aria-label="Close Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center p-3.5 rounded-xl transition-all duration-300 group ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary'
                  }`
                }
                onClick={toggleSidebar}
              >
                <div className={`p-2 rounded-lg transition-colors ${location.pathname === '/admin/dashboard' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10'}`}>
                  <FaThLarge className="text-lg" />
                </div>
                <span className="ml-4 font-bold text-sm">Dashboard</span>
              </NavLink>

              {/* Products Submenu */}
              <div className="space-y-1">
                <button
                  onClick={toggleProductsMenu}
                  className={`flex items-center justify-between w-full p-3.5 rounded-xl transition-all duration-300 group ${isProductRouteActive
                      ? 'bg-primary/5 text-primary border border-primary/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg transition-colors ${isProductRouteActive ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10'}`}>
                      <FaBox className="text-lg" />
                    </div>
                    <span className="ml-4 font-bold text-sm">Products</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isProductsOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaChevronRight className="text-sm opacity-50" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isProductsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-8 overflow-hidden space-y-1 mt-2 border-l-2 border-primary/10"
                    >
                      <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                          `flex items-center p-2.5 pl-5 text-sm font-semibold rounded-lg transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                          }`
                        }
                        onClick={toggleSidebar}
                      >
                        All Products
                      </NavLink>
                      <NavLink
                        to="/admin/featured"
                        className={({ isActive }) =>
                          `flex items-center p-2.5 pl-5 text-sm font-semibold rounded-lg transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                          }`
                        }
                        onClick={toggleSidebar}
                      >
                        Featured Products
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Links */}
              {[
                { to: '/admin/brands', icon: FaTags, label: 'Brands' },
                { to: '/admin/currencies', icon: FaDollarSign, label: 'Currencies' },
                { to: '/admin/customers', icon: FaUsers, label: 'Customers' },
                { to: '/admin/coupons', icon: FaTicketAlt, label: 'Coupons' },
                { to: '/admin/categories', icon: FaSitemap, label: 'Categories' },
                { to: '/admin/subcategories', icon: FaLayerGroup, label: 'SubCategories' },
                { to: '/admin/orders', icon: FaListAlt, label: 'Orders' },
                { to: '/admin/page', icon: FaAtom, label: 'Pages' },
                { to: '/admin/banner', icon: FaBullhorn, label: 'Banner' },
                { to: '/admin/setting', icon: FaSellcast, label: 'Settings' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center p-3.5 rounded-xl transition-all duration-300 group ${isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary'
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  <div className={`p-2 rounded-lg transition-colors ${location.pathname === item.to ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10'}`}>
                    <item.icon className="text-lg" />
                  </div>
                  <span className="ml-4 font-bold text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={logoutHandler}
                className="flex items-center w-full p-3.5 px-4 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 font-bold group"
              >
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:bg-red-100 transition-colors">
                  <FaSignOutAlt className="text-lg text-gray-400 group-hover:text-red-500" />
                </div>
                <span className="ml-4 text-sm">Sign Out Admin</span>
              </button>
            </div>
          </motion.aside>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;