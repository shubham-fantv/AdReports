"use client";
import ThemeToggle from '../../components/ThemeToggle';

export default function AdsHeader() {
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = '/';
  };

  return (
    <header className="bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/20 dark:border-[#2a2a2a] shadow-lg shadow-purple-500/10 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base sm:text-lg">📢</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Ads Data</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a0a0a0] hidden sm:block">Ad-level Performance Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="hidden sm:flex items-center space-x-2">
              <a
                href="/"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <span>🏠</span>
                <span>Home</span>
              </a>
              <a
                href="/daily-graphs"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <span>📊</span>
                <span>Daily Graphs</span>
              </a>
            </nav>
            
            {/* Mobile Navigation */}
            <nav className="sm:hidden flex items-center space-x-1">
              <a
                href="/"
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span>🏠</span>
              </a>
              <a
                href="/daily-graphs"
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span>📊</span>
              </a>
            </nav>
            
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
    </header>
  );
}