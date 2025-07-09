"use client";
import { useEffect, useState } from "react";
import { getTodayIST, getISTDate, formatDateString } from "../utils/dateHelpers";
import { subDays } from 'date-fns';
import { calculateCustomOverview, calculateCountryBasedOverview, exportToCSV } from "../utils/businessLogic";
import { apiService } from "../services/apiService";
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import DateRangePicker from '../components/DateRangePicker';
import DataTable from '../components/DataTable';
import OverviewCards from '../components/OverviewCards';
import { useMobileMenu } from '../contexts/MobileMenuContext';

// Helper function to check if account is MMS-type (mms or mms_af) or LF-type (lf_af)
const isMmsAccount = (account) => account === "mms" || account === "mms_af" || account === "lf_af";

// Helper function to check if account is VideoNation-type (default or videonation_af)
const isVideoNationAccount = (account) => account === "default" || account === "videonation_af" || account === "photonation_af";

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data state
  const [selectedAccount, setSelectedAccount] = useState("mms_af");
  const [selectedLevel, setSelectedLevel] = useState("account");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [activeDailyRange, setActiveDailyRange] = useState("L7");
  
  // Results state
  const [overview, setOverview] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [campaignTotals, setCampaignTotals] = useState(null);
  const [aggregateData, setAggregateData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filter state for MMS overview cards
  const [selectedFilters, setSelectedFilters] = useState({
    india_android: false,
    india_ios: false,
    us_android: false,
    us_ios: false,
    india_overall: true,
    us_overall: false,
    android_overall: false,
    ios_overall: false,
    complete_overall: false
  });

  // Inline filter state
  const [selectedCountry, setSelectedCountry] = useState("india");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["all"]);

  // Mobile menu state from context
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  // Watch for account changes and refetch data
  useEffect(() => {
    if (dailyStartDate && dailyEndDate) {
      console.log(`Account changed to ${selectedAccount}, refetching data`);
      fetchDailyData(dailyStartDate, dailyEndDate);
    }
  }, [selectedAccount]); // Only watch selectedAccount changes
  const [mounted, setMounted] = useState(false);

  // Check for existing authentication on page load
  useEffect(() => {
    setMounted(true);
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Set L7 (last 7 days) as default
      const today = getISTDate();
      const startDate = subDays(today, 7);
      const startDateStr = formatDateString(startDate);
      const endDateStr = formatDateString(today);
      
      setDailyStartDate(startDateStr);
      setDailyEndDate(endDateStr);
      setActiveDailyRange("L7");
      fetchDailyData(startDateStr, endDateStr);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    // Clear all data
    setTableData([]);
    setOverview(null);
    setAggregateData(null);
    setCampaignTotals(null);
  };

  // Handle platform checkbox changes
  const handlePlatformChange = (platform) => {
    setSelectedPlatforms(prev => {
      if (platform === "all") {
        return ["all"];
      } else {
        const newPlatforms = prev.filter(p => p !== "all");
        if (newPlatforms.includes(platform)) {
          const filtered = newPlatforms.filter(p => p !== platform);
          return filtered.length === 0 ? ["all"] : filtered;
        } else {
          return [...newPlatforms, platform];
        }
      }
    });
  };

  // Handle apply filters button
  const handleApplyFilters = () => {
    const newFilters = {
      india_android: false,
      india_ios: false,
      us_android: false,
      us_ios: false,
      india_overall: false,
      us_overall: false,
      android_overall: false,
      ios_overall: false,
      complete_overall: false
    };

    const hasAllPlatforms = selectedPlatforms.includes("all");
    const hasAndroid = selectedPlatforms.includes("android");
    const hasIOS = selectedPlatforms.includes("ios");

    if (selectedCountry === "all" && hasAllPlatforms) {
      // Show 3 sections: complete overall + android overall + ios overall
      newFilters.complete_overall = true;
      newFilters.android_overall = true;
      newFilters.ios_overall = true;
    } else if (selectedCountry === "all") {
      // Show all countries for selected platforms
      if (hasAndroid) {
        newFilters.india_android = true;
        newFilters.us_android = true;
      }
      if (hasIOS) {
        newFilters.india_ios = true;
        newFilters.us_ios = true;
      }
    } else if (hasAllPlatforms) {
      // Show all platforms for selected country
      if (selectedCountry === "india") {
        newFilters.india_overall = true;
      } else if (selectedCountry === "us") {
        newFilters.us_overall = true;
      }
    } else {
      // Show specific country + platform combinations
      if (hasAndroid) {
        const filterKey = `${selectedCountry}_android`;
        if (newFilters.hasOwnProperty(filterKey)) {
          newFilters[filterKey] = true;
        }
      }
      if (hasIOS) {
        const filterKey = `${selectedCountry}_ios`;
        if (newFilters.hasOwnProperty(filterKey)) {
          newFilters[filterKey] = true;
        }
      }
    }

    setSelectedFilters(newFilters);
  };

  const clearData = () => {
    setTableData([]);
    setOverview(null);
    setAggregateData(null);
    setCampaignTotals(null);
  };

  const fetchCampaignTotals = async (startDateStr, endDateStr) => {
    if (selectedLevel !== "campaign") return null;
    
    try {
      const totalsParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr,
        per_day: "false",
        account: selectedAccount,
        level: "campaign",
        fields: "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
      });
      
      const totalsResponse = await fetch(`/api/daily-reports?${totalsParams}`);
      const totalsResult = await totalsResponse.json();
      
      if (totalsResult?.data?.campaigns) {
        return totalsResult.data.campaigns;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching campaign totals:", error);
      return null;
    }
  };

  const fetchDailyData = async (startDateParam = null, endDateParam = null) => {
    setLoading(true);
    clearData(); // Clear previous data before fetching new data
    
    const startDateStr = startDateParam || dailyStartDate;
    const endDateStr = endDateParam || dailyEndDate;
    
    if (!startDateStr || !endDateStr) {
      console.error("Invalid dates:", { startDateStr, endDateStr });
      setLoading(false);
      return;
    }
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date objects:", { startDate, endDate });
      setLoading(false);
      return;
    }
    
    const dateArray = [];
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dateArray.push(new Date(dt).toISOString().split('T')[0]);
    }
    
    try {
      const allPromises = dateArray.map(date => {
        const fields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
          : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
          
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount,
          level: selectedLevel,
          fields: fields
        });
        console.log(`Making daily API call for ${selectedAccount} on ${date}: /api/daily-reports?${params}`);
        return fetch(`/api/daily-reports?${params}`).then(res => res.json());
      });
      
      const aggregateFields = selectedLevel === "campaign" 
        ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
        : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
        
      const aggregateParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr,
        per_day: "false",
        account: selectedAccount,
        level: selectedLevel,
        fields: aggregateFields
      });
      console.log(`Making aggregate API call for ${selectedAccount}: /api/daily-reports?${aggregateParams}`);
      const aggregatePromise = fetch(`/api/daily-reports?${aggregateParams}`).then(res => res.json());
      
      const campaignTotalsPromise = selectedLevel === "campaign" 
        ? fetchCampaignTotals(startDateStr, endDateStr)
        : Promise.resolve(null);
      
      const [allResults, aggregateResult, campaignTotalsResult] = await Promise.all([
        Promise.all(allPromises),
        aggregatePromise,
        campaignTotalsPromise
      ]);
      
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      console.log(`Final processed data for ${selectedAccount}:`, {
        campaignCount: allCampaigns.length,
        sampleCampaign: allCampaigns[0],
        totalSpend: allCampaigns.reduce((sum, c) => sum + parseFloat(c.spend || 0), 0)
      });
      
      setTableData(allCampaigns);
      setCampaignTotals(campaignTotalsResult);
      
      if (allCampaigns.length > 0) {
        const overviewFromDailyData = calculateCountryBasedOverview(allCampaigns, selectedAccount, selectedLevel, selectedFilters);
        setOverview(overviewFromDailyData);
      } else {
        // Clear overview when no campaigns data (zero spend)
        setOverview(null);
      }
      
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        setAggregateData(aggregateItem);
      } else {
        setAggregateData(null);
      }
      
    } catch (error) {
      console.error("Error fetching daily data for account:", selectedAccount, error);
      console.error("Date range:", startDateStr, "to", endDateStr);
      console.error("Error details:", error.message);
      setTableData([]);
      setOverview(null);
      setAggregateData(null);
      setCampaignTotals(null);
    }
    
    setLoading(false);
  };

  const handleDateRangeChange = (startDateStr, endDateStr) => {
    fetchDailyData(startDateStr, endDateStr);
  };

  const handleApplyDates = () => {
    clearData();
    setActiveDailyRange("custom");
    fetchDailyData();
  };

  const handleAccountChange = (newAccount) => {
    console.log(`Account changed to: ${newAccount}, updating state immediately`);
    setSelectedAccount(newAccount);
    // Clear all data immediately when account changes
    clearData();
  };

  const handleExportCSV = () => {
    exportToCSV(tableData, aggregateData, selectedAccount, selectedLevel, dailyStartDate, dailyEndDate);
  };

  // Refresh overview when filters change for MMS campaign level
  useEffect(() => {
    if (isMmsAccount(selectedAccount) && selectedLevel === "campaign" && tableData.length > 0) {
      console.log("Filters changed, recalculating overview...");
      const overviewFromDailyData = calculateCountryBasedOverview(tableData, selectedAccount, selectedLevel, selectedFilters);
      setOverview(overviewFromDailyData);
    }
  }, [selectedFilters, selectedAccount, selectedLevel, tableData]);

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
                <span className="text-white font-bold text-base sm:text-lg">📈</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Ad Reports Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a0a0a0] hidden sm:block">Analytics and Performance Insights</p>
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
                  href="/"
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-600 dark:to-teal-600 hover:from-green-700 hover:to-teal-700 dark:hover:from-green-700 dark:hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-green-500/20 dark:shadow-teal-500/20 text-sm lg:text-base"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </a>
                <a
                  href="/daily-graphs"
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 hover:from-purple-700 hover:to-pink-700 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20 dark:shadow-blue-500/20 text-sm lg:text-base"
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
            {/* Home Link */}
            <button
              onClick={() => { 
                window.location.href = "/"; 
                setIsMobileMenuOpen(false); 
              }}
              className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">🏠</span>
              <span className="font-medium">Home</span>
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
            
            {/* Dashboard Link (Current Page) */}
            <button
              onClick={() => { 
                window.scrollTo(0, 0); 
                setIsMobileMenuOpen(false); 
              }}
              className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <span className="mr-3 text-lg">📈</span>
              <span className="font-medium">Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Date Range Picker */}
        <DateRangePicker
          selectedAccount={selectedAccount}
          selectedLevel={selectedLevel}
          setSelectedAccount={setSelectedAccount}
          setSelectedLevel={setSelectedLevel}
          dailyStartDate={dailyStartDate}
          dailyEndDate={dailyEndDate}
          setDailyStartDate={setDailyStartDate}
          setDailyEndDate={setDailyEndDate}
          activeDailyRange={activeDailyRange}
          setActiveDailyRange={setActiveDailyRange}
          onDateRangeChange={handleDateRangeChange}
          onApplyDates={handleApplyDates}
          onClearData={clearData}
          onAccountChange={handleAccountChange}
        />

        {/* Data Table */}
        <DataTable
          tableData={tableData}
          campaignTotals={campaignTotals}
          aggregateData={aggregateData}
          selectedAccount={selectedAccount}
          selectedLevel={selectedLevel}
          loading={loading}
          onExportCSV={handleExportCSV}
        />

        {/* MMS Campaign Level Filters */}
        {isMmsAccount(selectedAccount) && selectedLevel === "campaign" && tableData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 mt-6 sm:mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🔍</span>
              Overview Card Filters
            </h3>
            <div className="space-y-3 sm:space-y-4 mb-4">
              {/* First Row: Country and Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Country Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country:
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Countries</option>
                    <option value="india">🇮🇳 India</option>
                    <option value="us">🇺🇸 US</option>
                  </select>
                </div>

                {/* Platform Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Platform:
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    {[
                      { value: "all", label: "All", icon: "🌍" },
                      { value: "android", label: "Android", icon: "🤖" },
                      { value: "ios", label: "iOS", icon: "🍎" }
                    ].map(platform => (
                      <label key={platform.value} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.value)}
                          onChange={() => handlePlatformChange(platform.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {platform.icon} <span className="hidden sm:inline">{platform.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Row: Apply Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 min-w-0"
                >
                  <span>✓</span>
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Select country and platform filters, then click Apply to update the overview cards below.
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <OverviewCards overview={overview} selectedAccount={selectedAccount} />
      </main>
    </div>
  );
}