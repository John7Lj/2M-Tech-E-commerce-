import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from 'react-redux';
import { auth } from '../../firebaseConfig';
import { useSignupUserMutation } from '../../redux/api/user.api';
import { userExists } from '../../redux/reducers/user.reducer';
import { AppDispatch } from '../../redux/store';
import { notify } from '../../utils/util';
import { motion } from 'framer-motion'; // Removed MotionConfig import
import {
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';

const SIGNUP_SUCCESS = 'Sign up successful';
const SIGNUP_FAILED = 'Sign up failed';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userCredential, setUserCredential] = useState<UserCredential | null>(null);

  const [signupUser] = useSignupUserMutation();
  const dispatch = useDispatch<AppDispatch>();

  const handleResponse = async (userCredential: UserCredential, successMessage: string, failureMessage: string) => {
    try {
      const idToken = await userCredential.user.getIdToken();
      const response = await signupUser({ idToken, name, gender, dob }).unwrap();

      if (response.user) {
        dispatch(userExists(response.user));
        notify(successMessage, 'success');
      } else {
        notify(failureMessage, 'error');
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'An unknown error occurred';
      notify(errorMessage, 'error');
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');

      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const userCredential = await signInWithPopup(auth, provider);
      setUserCredential(userCredential);
      setIsLoading(false);
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        const firebaseError = error as any;
        let errorMessage = 'Google sign-up failed';

        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-up was cancelled';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked. Please allow popups and try again.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Another sign-up popup is already open';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = error.message || 'Google sign-up failed';
        }

        notify(errorMessage, 'error');
      } else {
        notify('An unknown error occurred', 'error');
      }
    }
  };

  const handleInitialSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      notify('All fields are required', 'error');
      return;
    }
    if (password !== confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUserCredential(userCredential);
    } catch (error: unknown) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      } else {
        notify('An unknown error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!name || !gender || !dob) {
      notify('All fields are required', 'error');
      return;
    }
    if (userCredential) {
      setIsLoading(true);
      await handleResponse(userCredential, SIGNUP_SUCCESS, SIGNUP_FAILED);
      setUserCredential(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl transition-colors duration-500">
        <h5 className="text-2xl font-black text-center mb-10 text-gray-900 dark:text-white uppercase tracking-tighter">Sign Up</h5>

        {!userCredential && (
          <>
            {/* PRIORITIZED: Google Sign-Up (moved to top) */}
            <div className="mb-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <button
                  disabled={isLoading}
                  className={`flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-700 shadow-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 gap-3 w-full border border-gray-200 dark:border-gray-800 transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleGoogleSignup}
                >
                  <FcGoogle className='text-2xl' />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isLoading ? 'Setting up...' : 'Continue with Google'}</span>
                </button>
              </motion.div>
            </div>

            <div className="mb-6 flex items-center justify-center">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>

            {/* Traditional Email/Password Signup */}
            <motion.div whileHover={{ y: -2 }} className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-4 px-4 text-gray-900 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
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
                placeholder="••••••••"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-4 px-4 text-gray-900 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </motion.div>

            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Show Password</span>
              </label>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
              <button
                className={`bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-[10px] py-4 px-4 rounded-2xl focus:outline-none shadow-xl shadow-primary/20 w-full transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
                onClick={handleInitialSignUp}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up with Email'}
              </button>
            </motion.div>
          </>
        )}

        {userCredential && (
          <>
            <div className="mb-6 p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                Final Step: Complete your profile
              </p>
            </div>

            <motion.div whileHover={{ y: -2 }} className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-shadow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="gender">Gender</label>
              <select
                id="gender"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-shadow"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="mb-6">
              <label className="block text-sm font-bold mb-2" htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-shadow"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={isLoading}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
              <button
                className={`bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-[10px] py-4 px-4 rounded-2xl focus:outline-none shadow-xl shadow-primary/20 w-full transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
                onClick={handleCompleteSignup}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Account Setup →'}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
