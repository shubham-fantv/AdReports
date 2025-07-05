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
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">📢</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ads Data</h1>
              <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">Ad-level Performance Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              <a
                href="/"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>Home</span>
              </a>
              <a
                href="/daily-graphs"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Daily Graphs</span>
              </a>
            </nav>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}