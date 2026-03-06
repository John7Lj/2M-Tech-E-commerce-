import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useConstants } from '../hooks/useConstants';
import ecommerceAnimation from '../assets/ecommerce-animation.json';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const { constants, isLoading } = useConstants();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-secondary-dark p-6 transition-colors duration-500">
      <div className="flex w-full max-w-6xl bg-white dark:bg-gray-950 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-primary/5 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Left Side - Animated Section */}
        <div className="hidden lg:flex flex-col lg:w-1/2 items-center justify-center bg-gray-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
          <div className="w-full max-w-md px-12 relative z-10">
            <Lottie
              animationData={ecommerceAnimation}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: 'auto' }}
            />
            <div className="text-center mt-12">
              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
                {isLoading ? '...' : constants.companyName}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed font-medium uppercase tracking-widest text-[10px] opacity-70">
                Crafting Excellence • Delivering Value
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-30">
            <div className="text-[10px] font-black text-white uppercase tracking-widest">Premium quality</div>
            <div className="text-[10px] font-black text-white uppercase tracking-widest">Global delivery</div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-primary rounded-2xl mb-6 shadow-xl shadow-primary/30 flex items-center justify-center"
            >
              <div className="w-5 h-5 bg-white/30 rounded-full animate-pulse" />
            </motion.div>
            <motion.h1
              className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </motion.h1>
            <motion.p
              className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Discover {constants.companyName} Universe
            </motion.p>
          </div>

          <motion.div
            key={isSignUp ? 'signup' : 'login'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {isSignUp ? <Signup /> : <Login />}
          </motion.div>

          <div className="mt-12">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-950 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">OR</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col space-y-4">
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isSignUp ? 'Already have an account?' : 'New to our platform?'}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isSignUp
                    ? 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white'
                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark'
                  }`}
              >
                {isSignUp ? 'Sign In Instead' : 'Create Free Account'}
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-loose">
              By proceeding, you agree to our{' '}
              <a href="/pages/term" className="text-primary hover:underline">Terms & Conditions</a>
              <br />
              and <a href="/pages/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;