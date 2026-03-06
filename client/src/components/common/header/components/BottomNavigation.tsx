import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { bottomNavigationItems } from '../constants';
import { User as UserType } from '../types';

interface BottomNavigationProps {
  user: UserType | null;
  onProfileHandler: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ user, onProfileHandler }) => {
  const location = useLocation();

  return (
    <>
      {/* Enhanced Professional Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-5 left-4 right-4 z-50">
        <div className="bg-white/80 dark:bg-secondary-dark/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 px-2 py-1">
          <div className="grid grid-cols-5 gap-1">
            {bottomNavigationItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative flex flex-col items-center justify-center py-2 px-1 min-h-[56px] group transition-all"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      color: isActive ? '#D32F2F' : 'currentColor'
                    }}
                    className={`${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-[10px] font-bold mt-1 leading-tight tracking-tight ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            <button
              onClick={onProfileHandler}
              className="flex flex-col items-center justify-center py-2 px-1 min-h-[56px] text-gray-500 dark:text-gray-400 group transition-all"
            >
              <div className="group-hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold mt-1 leading-tight tracking-tight group-hover:text-primary">
                {user ? 'Account' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacers to prevent content overlap */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default BottomNavigation;