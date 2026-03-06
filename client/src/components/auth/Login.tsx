import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from 'react-redux';
import { auth } from '../../firebaseConfig';
import { useLoginUserMutation } from '../../redux/api/user.api';
import { userExists } from '../../redux/reducers/user.reducer';
import { AppDispatch } from '../../redux/store';
import { notify } from '../../utils/util';
import { motion } from 'framer-motion'; // Removed MotionConfig import
import {
    GoogleAuthProvider,
    UserCredential,
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';

const LOGIN_SUCCESS = 'Login successful';
const LOGIN_FAILED = 'Login failed';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [loginUser] = useLoginUserMutation();
    const dispatch = useDispatch<AppDispatch>();

    // Enhanced response handler with better error handling
    const handleResponse = async (userCredential: UserCredential, successMessage: string, failureMessage: string) => {
        try {
            const idToken = await userCredential.user.getIdToken(true); // Force refresh
            const response = await loginUser({ idToken }).unwrap();

            if (response.user) {
                dispatch(userExists(response.user));
                notify(successMessage, 'success');
            } else {
                notify(failureMessage, 'error');
            }
        } catch (error: any) {
            let errorMessage = 'An unknown error occurred';

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            if (error?.status === 401) {
                errorMessage = error.data?.message || 'Authentication failed. Please try again.';
            } else if (error?.status === 403) {
                errorMessage = error.data?.message || 'Access denied. Please contact support.';
            } else if (error?.status >= 500) {
                errorMessage = error.data?.message || 'Server error. Please try again later.';
            }

            notify(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced Google login with better error handling
    const handleGoogleLogin = async () => {
        setIsLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            provider.setCustomParameters({ prompt: 'select_account' });

            const userCredential = await signInWithPopup(auth, provider);
            await handleResponse(userCredential, LOGIN_SUCCESS, LOGIN_FAILED);
        } catch (error: unknown) {
            setIsLoading(false);

            let errorMessage = 'Google sign-in failed';

            if (error instanceof Error) {
                const firebaseError = error as any;
                switch (firebaseError.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Sign-in was cancelled';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage = 'Popup was blocked. Please allow popups and try again.';
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMessage = 'Another sign-in popup is already open';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = error.message || 'Google sign-in failed';
                }
            }

            notify(errorMessage, 'error');
        }
    };

    // Handles login with email and password
    const handleLogin = async () => {
        if (!email || !password) {
            notify('Email and password are required', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await handleResponse(userCredential, LOGIN_SUCCESS, LOGIN_FAILED);
        } catch (error: unknown) {
            setIsLoading(false);
            if (error instanceof Error) {
                notify(error.message, 'error');
            } else {
                notify('Email/password login failed', 'error');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl transition-colors duration-500">
                <h4 className="text-2xl font-black text-center mb-10 text-gray-900 dark:text-white uppercase tracking-tighter">Login</h4>

                {/* PRIORITIZED: Google Sign-In (moved to top) */}
                <div className="mb-6">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                        <button
                            className={`flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-700 shadow-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 gap-3 w-full border border-gray-200 dark:border-gray-800 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <FcGoogle className='text-2xl' />
                            <span className="text-[10px] font-black uppercase tracking-widest">{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                        </button>
                    </motion.div>
                </div>

                <div className="mb-6 flex items-center justify-center">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-4 text-gray-500 text-sm">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                {/* Traditional Email/Password Login */}
                <motion.div whileHover={{ y: -2 }} className="mb-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1" htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-4 px-4 text-gray-900 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="name@example.com"
                    />
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="mb-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1" htmlFor="password">Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-4 px-4 text-gray-900 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="••••••••"
                    />
                </motion.div>

                <div className="flex items-center mb-6">
                    <input
                        type="checkbox"
                        id="showPassword"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        className="mr-2 cursor-pointer"
                        disabled={isLoading}
                    />
                    <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                    <button
                        className={`bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-[10px] py-4 px-4 rounded-2xl focus:outline-none shadow-xl shadow-primary/20 w-full transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login with Email'}
                    </button>
                </motion.div>

                {/* Additional Links */}
                <div className="mt-4 text-center">
                    <motion.a
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary-dark transition-colors font-bold"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 1.05 }}
                    >
                        Forgot Password?
                    </motion.a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
