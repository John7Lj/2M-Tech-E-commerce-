import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { useLoginUserMutation } from '../../redux/api/user.api';
import { userExists } from '../../redux/reducers/user.reducer';
import { AppDispatch } from '../../redux/store';
import { notify } from '../../utils/util';
import { motion } from 'framer-motion';
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
    const navigate = useNavigate();

    const handleResponse = async (userCredential: UserCredential, successMessage: string, failureMessage: string) => {
        try {
            const idToken = await userCredential.user.getIdToken(true);
            const response = await loginUser({ idToken }).unwrap();

            if (response.user) {
                // Store token for header-based auth fallback
                if (response.token) {
                    localStorage.setItem('admin_token', response.token);
                }

                dispatch(userExists(response.user));
                notify(successMessage, 'success');

                if (response.user.role === 'admin') {
                    setTimeout(() => {
                        navigate('/admin/dashboard', { replace: true });
                    }, 100);
                } else {
                    notify('Access denied. Admin privileges required.', 'error');
                }
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
                errorMessage = 'Authentication failed. Please try again.';
            } else if (error?.status === 403) {
                errorMessage = 'Access denied. Please contact support.';
            } else if (error?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            notify(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

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
            <div className="w-full max-w-md bg-white rounded-lg p-6">
                <h4 className="text-xl font-bold text-center mb-8">Login</h4>

                <div className="mb-6">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                        <button
                            className={`flex items-center justify-center text-gray-700 font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-md bg-white hover:bg-gray-100 gap-2 w-full border border-gray-300 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <FcGoogle className='text-2xl' />
                            {isLoading ? 'Signing in...' : 'Continue with Google'}
                        </button>
                    </motion.div>
                </div>

                <div className="mb-6 flex items-center justify-center">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-4 text-gray-500 text-sm">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                <motion.div whileHover={{ y: -2 }} className="mb-4">
                    <label className="block text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-shadow"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter your email"
                    />
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="mb-4">
                    <label className="block text-sm font-bold mb-2" htmlFor="password">Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-shadow"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter your password"
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
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login with Email'}
                    </button>
                </motion.div>


            </div>
        </div>
    );
};

export default LoginPage;