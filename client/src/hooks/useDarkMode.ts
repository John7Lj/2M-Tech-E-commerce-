// client/src/hooks/useDarkMode.ts
// FIXED: Consistent API - exports both isDark and isDarkMode for compatibility

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') return stored;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {}
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Alias so both usages work:
  // Header uses: isDarkMode, toggleDarkMode
  // DarkModeToggle uses: isDark, toggleTheme
  return {
    theme,
    toggleTheme,
    toggleDarkMode: toggleTheme,   // alias for Header
    isDark: theme === 'dark',
    isDarkMode: theme === 'dark',  // alias for Header
    setDark: () => setTheme('dark'),
    setLight: () => setTheme('light'),
  };
};

export default useDarkMode;