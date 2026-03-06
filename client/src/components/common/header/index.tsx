import React from 'react';
import { signOut } from 'firebase/auth';
import { Menu, Sun, Moon, Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../../firebaseConfig';
import { useLogoutUserMutation } from '../../../redux/api/user.api';
import { userNotExists } from '../../../redux/reducers/user.reducer';
import { RootState } from '../../../redux/store';
import { notify } from '../../../utils/util';

// Import custom hooks
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { useSidebar } from './hooks/useSidebar';
import { useProfileMenu } from './hooks/useProfileMenu';
import { useDarkMode } from '../../../hooks/useDarkMode';

// Import components
import Logo from './components/Logo';
import SearchBar from '../../collection_files/SearchBar';
import ProfileMenu from './components/ProfileMenu';
import MobileUserButton from './components/MobileUserButton';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';

const Header: React.FC = () => {
  const isScrolled = useHeaderScroll();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const {
    isProfileMenuOpen,
    profileMenuRef,
    profileButtonRef,
    handleMouseEnter,
    handleMouseLeave
  } = useProfileMenu();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logout] = useLogoutUserMutation();

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      await logout().unwrap();
      dispatch(userNotExists());
      notify('Logout successful', 'success');
      navigate('/auth');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      notify(errorMessage, 'error');
    }
  };

  const profileHandler = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${isSidebarOpen
            ? 'bg-white dark:bg-[#121212] border-gray-100 dark:border-gray-800 py-2'
            : isScrolled
              ? 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md shadow-sm border-gray-100 dark:border-gray-800 py-2'
              : 'bg-white dark:bg-[#121212] border-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Logo onLogoClick={closeSidebar} />
            </div>

            {/* Search Bar - Hidden on small mobile, expanded on others */}
            <div className="hidden sm:flex flex-1 max-w-xl mx-4 lg:mx-12">
              <div className="w-full relative group">
                <SearchBar className="!py-2 !px-4 !bg-accent dark:!bg-gray-800 !rounded-full !border-none !text-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all" />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* Mobile Search Toggle */}
              <motion.button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 sm:hidden rounded-full bg-accent dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </motion.button>

              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-accent dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Desktop Profile Menu */}
              <div className="hidden md:block">
                <ProfileMenu
                  user={user}
                  isProfileMenuOpen={isProfileMenuOpen}
                  profileMenuRef={profileMenuRef}
                  profileButtonRef={profileButtonRef}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  onLogout={logoutHandler}
                />
              </div>

              {/* Mobile User Button */}
              <div className="md:hidden">
                <MobileUserButton onClick={profileHandler} />
              </div>

              {/* Sidebar Toggle */}
              <motion.button
                onClick={toggleSidebar}
                className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212]"
            >
              <div className="p-4">
                <SearchBar className="!py-2 !px-4 !bg-accent dark:!bg-gray-800 !rounded-full !border-none !text-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onClose={closeSidebar}
        user={user}
        onProfileHandler={profileHandler}
        onLogout={logoutHandler}
      />

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation
        user={user}
        onProfileHandler={profileHandler}
      />
    </>
  );
};

export default Header;