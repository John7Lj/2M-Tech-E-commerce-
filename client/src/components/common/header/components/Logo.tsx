import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConstants } from '../../../../hooks/useConstants';

interface LogoProps {
  onLogoClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ onLogoClick }) => {
  const { constants, isLoading } = useConstants();

  if (isLoading) {
    // Show loading placeholder
    return (
      <div className="flex items-center">
        <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 group">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="hidden sm:block">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Link to="/" onClick={onLogoClick} className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 group">
        <motion.div
          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
          whileHover={{ scale: 1.1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img
            src={constants.logo}
            alt={`${constants.companyName} Logo`}
            className="w-full h-full rounded-lg object-cover transition-all duration-500 ease-out group-hover:brightness-110"
            onError={(e) => {
              // Fallback to default logo if custom logo fails
              e.currentTarget.src = '/logo.svg';
            }}
          />
        </motion.div>

        <div className="hidden sm:block">
          <motion.span
            className="text-xl md:text-2xl lg:text-3xl font-black text-primary dark:text-white uppercase tracking-tighter"
          >
            {constants.companyName}
          </motion.span>
        </div>
      </Link>
    </div>
  );
};

export default Logo;