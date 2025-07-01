'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-xs ${
            theme === 'dark' 
              ? 'translate-x-6 rotate-180 bg-white text-blue-600' 
              : 'translate-x-1 rotate-0 bg-white text-yellow-500'
          }`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        <span className="sr-only">
          {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        </span>
      </button>
    </div>
  );
}