import React from 'react';
import Login from '../components/auth/Login';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useConstants } from '../hooks/useConstants';

import ecommerceAnimation from '../assets/ecommerce-animation.json'; // Replace with your actual animation file

const AuthPage: React.FC = () => {
  const { constants, isLoading } = useConstants();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Side - Lottie Animation */}
        <div className="hidden md:flex flex-col md:w-1/2 items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
          <div className="w-full max-w-md px-8">
            <Lottie
              animationData={ecommerceAnimation}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: 'auto' }}
            />
            <div className="text-center mt-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                {isLoading ? 'Loading...' : `${constants.companyName} Admin`}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Secure admin portal for managing your ecommerce platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isLoading ? 'Loading...' : constants.companyName}
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm lg:text-base"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Admin Portal - Authorized Access Only
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Login />
          </motion.div>

          {/* Admin Notice */}
          <div className="mt-8 text-center">
            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-primary">Admin Access Required</h3>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                This portal is restricted to authorized administrators only.
                If you need access, please contact your system administrator.
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/pages/term" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/pages/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;