"use client";
import { useEffect, useState } from "react";
import { getTodayIST } from "./utils/dateHelpers";
import { calculateCustomOverview, calculateCountryBasedOverview, exportToCSV } from "./utils/businessLogic";
import { apiService } from "./services/apiService";
import ThemeToggle from './components/ThemeToggle';
import LoginForm from './components/LoginForm';
import DateRangePicker from './components/DateRangePicker';
import DataTable from './components/DataTable';
import OverviewCards from './components/OverviewCards';

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data state
  const [selectedAccount, setSelectedAccount] = useState("default");
  const [selectedLevel, setSelectedLevel] = useState("account");
  const [dailyStartDate, setDailyStartDate] = useState(() => getTodayIST());
  const [dailyEndDate, setDailyEndDate] = useState(() => getTodayIST());
  const [activeDailyRange, setActiveDailyRange] = useState("today");
  
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

  // Check for existing authentication on page load
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const todayStr = getTodayIST();
      setDailyStartDate(todayStr);
      setDailyEndDate(todayStr);
      setActiveDailyRange("today");
      fetchDailyData(todayStr, todayStr);
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
      
      setTableData(allCampaigns);
      setCampaignTotals(campaignTotalsResult);
      
      if (allCampaigns.length > 0) {
        const overviewFromDailyData = calculateCountryBasedOverview(allCampaigns, selectedAccount, selectedLevel, selectedFilters);
        setOverview(overviewFromDailyData);
      }
      
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        setAggregateData(aggregateItem);
      } else {
        setAggregateData(null);
      }
      
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setTableData([]);
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

  const handleExportCSV = () => {
    exportToCSV(tableData, aggregateData, selectedAccount, selectedLevel, dailyStartDate, dailyEndDate);
  };

  // Refresh overview when filters change for MMS campaign level
  useEffect(() => {
    if (selectedAccount === "mms" && selectedLevel === "campaign" && tableData.length > 0) {
      console.log("Filters changed, recalculating overview...");
      const overviewFromDailyData = calculateCountryBasedOverview(tableData, selectedAccount, selectedLevel, selectedFilters);
      setOverview(overviewFromDailyData);
    }
  }, [selectedFilters, selectedAccount, selectedLevel, tableData]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <LoginForm onLoginSuccess={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800 backdrop-blur-xl border-b border-white/20 dark:border-gray-700 sticky top-0 z-40 shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">📈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Reports Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analytics and Performance Insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
                <a
                  href="/daily-graphs"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {selectedAccount === "mms" && selectedLevel === "campaign" && tableData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🔍</span>
              Overview Card Filters
            </h3>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Country Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country:
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Countries</option>
                  <option value="india">🇮🇳 India</option>
                  <option value="us">🇺🇸 US</option>
                </select>
              </div>

              {/* Platform Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Platform:
                </label>
                <div className="flex items-center gap-3 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
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
                        {platform.icon} {platform.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>✓</span>
                Apply Filters
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Select country and platform filters, then click Apply to update the overview cards below.
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <OverviewCards overview={overview} />
      </main>
    </div>
  );
}