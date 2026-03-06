import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { useConstants } from '../../hooks/useConstants';

const AdminLayout: React.FC = () => {
  const { constants } = useConstants();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('admin-theme') === 'dark' ||
      (!localStorage.getItem('admin-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Unified Header - Premium Glassmorphism like Client */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm z-30 px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-all shadow-sm group"
          >
            <FaBars className="text-lg group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center p-1.5 overflow-hidden">
              <img src={constants.logo} alt="L" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:block text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {constants.companyName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 shadow-sm"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <FaSun className="text-lg text-amber-500" /> : <FaMoon className="text-lg text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden" style={{ height: '100vh' }}>
        <div className="pt-16 h-full overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-900/10">
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;