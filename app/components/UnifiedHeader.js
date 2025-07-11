"use client";
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function UnifiedHeader({ 
  title = "Dashboard", 
  icon = "📊", 
  currentPage = "home" 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = '/';
  };

  const navigationItems = [
    { key: 'home', href: '/', label: 'Home', icon: '🏠' },
    { key: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'daily-graphs', href: '/daily-graphs', label: 'Graphs', icon: '📈' },
    { key: 'ads', href: '/ads', label: 'Ads', icon: '📢' },
    { key: 'reports', href: '/reports', label: 'Reports', icon: '📋' }
  ];

  return (
    <header className="bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/20 dark:border-[#2a2a2a] shadow-lg shadow-purple-500/10 dark:shadow-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base sm:text-lg">{icon}</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                  currentPage === item.key
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Right: Theme Toggle and Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base min-h-[44px]"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-2 space-y-1 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                currentPage === item.key
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}