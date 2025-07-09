"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "./utils/currencyHelpers";
import { getActionValue, getISTDate, formatDateString } from "./utils/dateHelpers";
import { subDays } from 'date-fns';
import ThemeToggle from './components/ThemeToggle';
import LoginForm from './components/LoginForm';
import { useMobileMenu } from './contexts/MobileMenuContext';

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountsData, setAccountsData] = useState([]);
  const [mounted, setMounted] = useState(false);
  
  // Date state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRange, setActiveRange] = useState("L1");

  // Mobile menu state from context
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  // Check for existing authentication on page load
  useEffect(() => {
    setMounted(true);
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data for all accounts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Set yesterday as default (L1)
      const today = getISTDate();
      const yesterday = subDays(today, 1);
      const startDateStr = formatDateString(yesterday);
      const endDateStr = formatDateString(yesterday);
      
      setStartDate(startDateStr);
      setEndDate(endDateStr);
      setActiveRange("L1");
      fetchAllAccountsData(startDateStr, endDateStr);
    }
  }, [isAuthenticated]);

  const accounts = [
    { key: "mms_af", name: "MMS AF" },
    { key: "lf_af", name: "LF AF" },
    { key: "photonation_af", name: "PhotoNation AF" }
  ];

  const fetchAllAccountsData = async (startDateParam = null, endDateParam = null) => {
    setLoading(true);
    const startDateStr = startDateParam || startDate;
    const endDateStr = endDateParam || endDate;
    
    console.log("Fetching data with dates:", { startDateStr, endDateStr });
    
    if (!startDateStr || !endDateStr) {
      console.error("Invalid dates:", { startDateStr, endDateStr });
      setLoading(false);
      return;
    }
    
    try {
      const promises = accounts.map(async (account) => {
        try {
          const params = new URLSearchParams({
            start_date: startDateStr,
            end_date: endDateStr,
            per_day: "false",
            account: account.key,
            level: "account",
            fields: "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
          });
          
          const response = await fetch(`/api/daily-reports?${params}`);
          const result = await response.json();
          
          if (result?.data?.campaigns?.[0]) {
            const data = result.data.campaigns[0];
            const purchases = getActionValue(data.actions, "purchase");
            const spend = parseFloat(data.spend || 0);
            const costPerPurchase = purchases > 0 ? spend / purchases : 0;
            
            return {
              account: account.name,
              spend: spend,
              purchases: purchases,
              costPerPurchase: costPerPurchase,
              success: true
            };
          }
          
          return {
            account: account.name,
            spend: 0,
            purchases: 0,
            costPerPurchase: 0,
            success: false
          };
        } catch (error) {
          console.error(`Error fetching ${account.name}:`, error);
          return {
            account: account.name,
            spend: 0,
            purchases: 0,
            costPerPurchase: 0,
            success: false
          };
        }
      });
      
      const results = await Promise.all(promises);
      setAccountsData(results);
    } catch (error) {
      console.error("Error fetching accounts data:", error);
    }
    
    setLoading(false);
  };

  const handleQuickDateRange = (days, rangeKey) => {
    const today = getISTDate();
    let rangeStartDate, rangeEndDate;
    
    if (days === 0) {
      // L0 means today only
      rangeStartDate = today;
      rangeEndDate = today;
    } else if (days === 1) {
      // L1 means yesterday only
      rangeStartDate = subDays(today, 1);
      rangeEndDate = subDays(today, 1);
    } else {
      // L7, L10, L30 means from X days ago to today
      rangeStartDate = subDays(today, days);
      rangeEndDate = today;
    }
    
    const startDateStr = formatDateString(rangeStartDate);
    const endDateStr = formatDateString(rangeEndDate);
    
    console.log(`Quick range ${rangeKey}: ${startDateStr} to ${endDateStr}`);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setActiveRange(rangeKey);
    
    fetchAllAccountsData(startDateStr, endDateStr);
  };

  const handleApplyCustomDates = () => {
    setActiveRange("custom");
    fetchAllAccountsData();
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setAccountsData([]);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <LoginForm onLoginSuccess={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/20 dark:border-[#2a2a2a] shadow-lg shadow-purple-500/10 dark:shadow-black/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base sm:text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a0a0a0] hidden sm:block">Performance Overview</p>
              </div>
            </div>

            {/* Right: Navigation and Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Hamburger Menu */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Open sidebar"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex items-center space-x-2">
                <a
                  href="/dashboard"
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 hover:from-purple-700 hover:to-pink-700 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20 dark:shadow-blue-500/20 text-sm lg:text-base"
                >
                  <span>📈</span>
                  <span>Dashboard</span>
                </a>
                <a
                  href="/daily-graphs"
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-600 dark:to-blue-600 hover:from-green-700 hover:to-blue-700 dark:hover:from-green-700 dark:hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-green-500/20 dark:shadow-blue-500/20 text-sm lg:text-base"
                >
                  <span>📊</span>
                  <span>Daily Graphs</span>
                </a>
              </nav>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar Content */}
          <div className="p-4 space-y-4">
            {/* Dashboard Link */}
            <button
              onClick={() => { 
                window.location.href = "/dashboard"; 
                setIsMobileMenuOpen(false); 
              }}
              className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">📈</span>
              <span className="font-medium">Dashboard</span>
            </button>
            
            {/* Daily Graphs Link */}
            <button
              onClick={() => { 
                window.location.href = "/daily-graphs"; 
                setIsMobileMenuOpen(false); 
              }}
              className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">📊</span>
              <span className="font-medium">Daily Graphs</span>
            </button>
            
            {/* Home Link (Current Page) */}
            <button
              onClick={() => { 
                window.scrollTo(0, 0); 
                setIsMobileMenuOpen(false); 
              }}
              className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">🏠</span>
              <span className="font-medium">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Executive Overview
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Performance metrics across all accounts
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-6">
            {/* Quick Date Range Buttons */}
            <div className="sm:flex-shrink-0">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Quick Ranges
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Today", days: 0, key: "L0" },
                  { label: "Yesterday", days: 1, key: "L1" },
                  { label: "L7", days: 7, key: "L7" },
                  { label: "L10", days: 10, key: "L10" },
                  { label: "L30", days: 30, key: "L30" },
                ].map(range => (
                  <button
                    key={range.key}
                    onClick={() => handleQuickDateRange(range.days, range.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-[auto] flex-shrink-0 ${
                      activeRange === range.key
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end lg:gap-3 gap-4 lg:flex-nowrap">
              <div className="lg:flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full lg:w-36 p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
                />
              </div>
              <div className="lg:flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full lg:w-36 p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
                />
              </div>
              <div className="col-span-1 sm:col-span-2 lg:col-span-1 lg:flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 lg:opacity-0">
                  Apply
                </label>
                <button
                  onClick={handleApplyCustomDates}
                  className="w-full lg:w-auto px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-800 dark:text-white font-semibold text-lg">Loading Executive Data</p>
                <p className="text-blue-700 dark:text-gray-200 text-sm mt-1">Fetching performance metrics...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountsData.map((account, index) => (
              <div key={index} className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {account.account}
                  </h3>
                  <div className={`w-3 h-3 rounded-full ${account.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spend</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.spend)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Purchases</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {account.purchases.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Purchase</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {account.costPerPurchase > 0 ? formatCurrency(account.costPerPurchase) : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchAllAccountsData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 hover:from-purple-700 hover:to-pink-700 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20 dark:shadow-blue-500/20 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}