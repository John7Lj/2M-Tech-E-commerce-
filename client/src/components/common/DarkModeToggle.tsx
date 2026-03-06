// client/src/components/common/DarkModeToggle.tsx
// Use this component in your Navbar/Header wherever the dark mode toggle button is

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-11 h-11 flex items-center justify-center rounded-xl
        transition-all duration-300
        ${isDark
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
        }
        ${className}
      `}
    >
      <span className={`transition-all duration-300 ${isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0 absolute'}`}>
        <Sun className="w-5 h-5" />
      </span>
      <span className={`transition-all duration-300 ${isDark ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}>
        <Moon className="w-5 h-5" />
      </span>
    </button>
  );
};

export default DarkModeToggle;