import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileMenuProps {
  user: UserType | null;
  isProfileMenuOpen: boolean;
  profileMenuRef: React.RefObject<HTMLDivElement>;
  profileButtonRef: React.RefObject<HTMLDivElement>;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  isProfileMenuOpen,
  profileMenuRef,
  profileButtonRef,
  handleMouseEnter,
  handleMouseLeave,
  onLogout
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="hidden md:flex items-center">
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={profileButtonRef}
      >
        <button
          className="flex items-center space-x-3 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          onClick={!user ? () => navigate('/auth') : undefined}
        >
          <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span>
            {user ? (user.role === 'admin' ? 'Admin' : 'Account') : 'Sign In'}
          </span>
          {user && (
            <motion.div
              animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          )}
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isProfileMenuOpen && user && (
            <motion.div
              ref={profileMenuRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-secondary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Settings</p>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                    whileHover={{ x: 5 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mx-4 my-2 h-px bg-gray-100 dark:bg-gray-800"></div>

              <motion.button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                whileHover={{ x: 5 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileMenu;