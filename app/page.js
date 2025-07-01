"use client";
import { useEffect, useState } from "react";
import ThemeToggle from './components/ThemeToggle';

const presets = [
  "today",
  "yesterday",
  "this_month",
  "last_month",
  "this_quarter",
  "maximum",
  "data_maximum",
  "last_3d",
  "last_7d",
  "last_14d",
  "last_28d",
  "last_30d",
  "last_90d",
  "last_week_mon_sun",
  "last_week_sun_sat",
  "last_quarter",
  "last_year",
  "this_week_mon_today",
  "this_week_sun_today",
  "this_year",
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [mode, setMode] = useState("daily");
  const [presetDate, setPresetDate] = useState("yesterday");
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");
  const [perDay, setPerDay] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2025-06-30");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [activeDailyRange, setActiveDailyRange] = useState("last7");
  const [aggregateData, setAggregateData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState("default");

  const [overview, setOverview] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getActionValue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || 0) : 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
      } else {
        setLoginError(result.message || "Invalid credentials");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }

    setLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setUsername("");
    setPassword("");
  };

  // Check for existing authentication on page load
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const exportToCSV = () => {
    if (!tableData.length && !aggregateData) {
      alert("No data to export");
      return;
    }

    // Prepare data for CSV
    const csvData = [];
    
    // Add header row
    if (selectedAccount === "mms") {
      csvData.push([
        "Date",
        "Spend (INR)",
        "Impressions",
        "Clicks",
        "CPC",
        "CPM",
        "CTR",
        "Frequency",
        "Mobile App Install",
        "Purchase",
        "Complete Registration"
      ]);
    } else {
      csvData.push([
        "Date",
        "Spend (INR)",
        "Impressions",
        "Clicks",
        "CPC",
        "CPM",
        "CTR",
        "Frequency",
        "Add to Cart",
        "Purchase",
        "Initiate Checkout",
        "Complete Registration"
      ]);
    }

    // Add daily data rows
    tableData.forEach(item => {
      if (selectedAccount === "mms") {
        csvData.push([
          item.date_start || item.date,
          Math.round(item.spend || 0),
          item.impressions || 0,
          item.clicks || 0,
          Math.round(item.cpc || 0),
          Math.round(item.cpm || 0),
          parseFloat(item.ctr || 0).toFixed(2),
          Math.round((item.frequency || 0) * 100) / 100,
          getActionValue(item.actions, "mobile_app_install"),
          getActionValue(item.actions, "purchase"),
          getActionValue(item.actions, "complete_registration")
        ]);
      } else {
        csvData.push([
          item.date_start || item.date,
          Math.round(item.spend || 0),
          item.impressions || 0,
          item.clicks || 0,
          Math.round(item.cpc || 0),
          Math.round(item.cpm || 0),
          parseFloat(item.ctr || 0).toFixed(2),
          Math.round((item.frequency || 0) * 100) / 100,
          getActionValue(item.actions, "add_to_cart"),
          getActionValue(item.actions, "purchase"),
          getActionValue(item.actions, "initiate_checkout"),
          getActionValue(item.actions, "complete_registration")
        ]);
      }
    });

    // Add aggregate/total row if available
    if (aggregateData) {
      if (selectedAccount === "mms") {
        csvData.push([
          `TOTAL (${dailyStartDate} to ${dailyEndDate})`,
          Math.round(aggregateData.spend || 0),
          aggregateData.impressions || 0,
          aggregateData.clicks || 0,
          Math.round(aggregateData.cpc || 0),
          Math.round(aggregateData.cpm || 0),
          parseFloat(aggregateData.ctr || 0).toFixed(2),
          Math.round((aggregateData.frequency || 0) * 100) / 100,
          getActionValue(aggregateData.actions, "mobile_app_install"),
          getActionValue(aggregateData.actions, "purchase"),
          getActionValue(aggregateData.actions, "complete_registration")
        ]);
      } else {
        csvData.push([
          `TOTAL (${dailyStartDate} to ${dailyEndDate})`,
          Math.round(aggregateData.spend || 0),
          aggregateData.impressions || 0,
          aggregateData.clicks || 0,
          Math.round(aggregateData.cpc || 0),
          Math.round(aggregateData.cpm || 0),
          parseFloat(aggregateData.ctr || 0).toFixed(2),
          Math.round((aggregateData.frequency || 0) * 100) / 100,
          getActionValue(aggregateData.actions, "add_to_cart"),
          getActionValue(aggregateData.actions, "purchase"),
          getActionValue(aggregateData.actions, "initiate_checkout"),
          getActionValue(aggregateData.actions, "complete_registration")
        ]);
      }
    }

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => `"${field}"`).join(",")
    ).join("\n");

    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `campaign-performance-${dailyStartDate}-to-${dailyEndDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateCustomOverview = (campaigns) => {
    if (!campaigns.length) return null;

    const totalSpend = campaigns.reduce(
      (sum, c) => sum + parseFloat(c.spend || 0),
      0
    );
    const totalImpressions = campaigns.reduce(
      (sum, c) => sum + parseInt(c.impressions || 0),
      0
    );
    const totalClicks = campaigns.reduce(
      (sum, c) => sum + parseInt(c.clicks || 0),
      0
    );
    const totalReach = campaigns.reduce(
      (sum, c) => sum + parseInt(c.reach || 0),
      0
    );

    const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const averageCPM =
      totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const averageCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const frequency = totalReach > 0 ? totalImpressions / totalReach : 0;

    return {
      total_spend: totalSpend,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_reach: totalReach,
      average_cpc: averageCPC,
      average_cpm: averageCPM,
      average_ctr: averageCTR,
      frequency: frequency,
    };
  };

  const fetchPresetData = async () => {
    setLoading(true);
    const endpoint = mode === "daily" ? "/api/daily-reports" : "/api/dashboard";
    const params = new URLSearchParams({
      date_preset: presetDate,
      account: selectedAccount,
      ...(mode === "daily" && { per_day: perDay.toString() })
    });
    const res = await fetch(`${endpoint}?${params}`);
    const json = await res.json();
    console.log(json);
    setOverview(json?.data?.overview || null);
    setTableData(json?.data?.campaigns || []);
    setLoading(false);
  };

  const fetchDailyData = async () => {
    setLoading(true);
    
    // Generate array of dates between start and end
    const startDate = new Date(dailyStartDate);
    const endDate = new Date(dailyEndDate);
    const dateArray = [];
    
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dateArray.push(new Date(dt).toISOString().split('T')[0]);
    }
    
    try {
      // Make separate API call for each day
      const allPromises = dateArray.map(date => {
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount
        });
        return fetch(`/api/daily-reports?${params}`).then(res => res.json());
      });
      
      // Also fetch aggregate data for the entire date range
      const aggregateParams = new URLSearchParams({
        start_date: dailyStartDate,
        end_date: dailyEndDate,
        per_day: "false",
        account: selectedAccount
      });
      const aggregatePromise = fetch(`/api/daily-reports?${aggregateParams}`).then(res => res.json());
      
      const [allResults, aggregateResult] = await Promise.all([
        Promise.all(allPromises),
        aggregatePromise
      ]);
      
      // Combine all campaigns from all days
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      console.log("Combined data:", allCampaigns);
      console.log("Aggregate data:", aggregateResult);
      
      setTableData(allCampaigns);
      
      // Extract aggregate data correctly
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        console.log("Setting aggregate data:", aggregateItem);
        console.log("Aggregate data will be:", aggregateItem);
        setAggregateData(aggregateItem);
      } else {
        console.log("No aggregate data found");
        setAggregateData(null);
      }
      
      setOverview(null); // No overview for daily reports
      
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setTableData([]);
      setAggregateData(null);
      setOverview(null);
    }
    
    setLoading(false);
  };

  const setDateRange = async (days, rangeKey) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // Yesterday
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1)); // Get exactly 'days' number of days
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    setDailyStartDate(startDateStr);
    setDailyEndDate(endDateStr);
    setActiveDailyRange(rangeKey);
    
    // Immediately fetch data for the quick range selection
    setLoading(true);
    
    try {
      // Fetch daily breakdown data
      const dateArray = [];
      for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
        dateArray.push(new Date(dt).toISOString().split('T')[0]);
      }
      
      const allPromises = dateArray.map(date => {
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount
        });
        return fetch(`/api/daily-reports?${params}`).then(res => res.json());
      });
      
      const aggregateParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr,
        per_day: "false",
        account: selectedAccount
      });
      const aggregatePromise = fetch(`/api/daily-reports?${aggregateParams}`).then(res => res.json());
      
      const [allResults, aggregateResult] = await Promise.all([
        Promise.all(allPromises),
        aggregatePromise
      ]);
      
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      setTableData(allCampaigns);
      
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        setAggregateData(aggregateItem);
      } else {
        setAggregateData(null);
      }
      
      // Also fetch campaign performance overview
      const customRes = await fetch(`/api/custom?start=${startDateStr}&end=${endDateStr}&account=${selectedAccount}`);
      const customJson = await customRes.json();
      const customData = customJson?.data || [];
      setOverview(calculateCustomOverview(customData));
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
      setAggregateData(null);
      setOverview(null);
    }
    
    setLoading(false);
  };

  const setThisMonth = async () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = yesterday.toISOString().split('T')[0];
    
    setDailyStartDate(startDateStr);
    setDailyEndDate(endDateStr);
    setActiveDailyRange("thisMonth");
    
    // Immediately fetch data for this month
    setLoading(true);
    
    try {
      // Fetch daily breakdown data
      const dateArray = [];
      for (let dt = new Date(startOfMonth); dt <= yesterday; dt.setDate(dt.getDate() + 1)) {
        dateArray.push(new Date(dt).toISOString().split('T')[0]);
      }
      
      const allPromises = dateArray.map(date => {
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount
        });
        return fetch(`/api/daily-reports?${params}`).then(res => res.json());
      });
      
      const aggregateParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr,
        per_day: "false",
        account: selectedAccount
      });
      const aggregatePromise = fetch(`/api/daily-reports?${aggregateParams}`).then(res => res.json());
      
      const [allResults, aggregateResult] = await Promise.all([
        Promise.all(allPromises),
        aggregatePromise
      ]);
      
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      setTableData(allCampaigns);
      
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        setAggregateData(aggregateItem);
      } else {
        setAggregateData(null);
      }
      
      // Also fetch campaign performance overview
      const customRes = await fetch(`/api/custom?start=${startDateStr}&end=${endDateStr}&account=${selectedAccount}`);
      const customJson = await customRes.json();
      const customData = customJson?.data || [];
      setOverview(calculateCustomOverview(customData));
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
      setAggregateData(null);
      setOverview(null);
    }
    
    setLoading(false);
  };

  const fetchCustomData = async () => {
    setLoading(true);
    const res = await fetch(`/api/custom?start=${startDate}&end=${endDate}&account=${selectedAccount}`);
    const json = await res.json();
    const data = json?.data || [];

    setTableData(data);
    setOverview(calculateCustomOverview(data));
    setLoading(false);
  };

  const loadData = () => {
    if (mode === "preset" || mode === "daily") {
      fetchPresetData();
    } else {
      fetchCustomData();
    }
  };

  useEffect(() => {
    // Set default Last 7 Days range and load data on page load
    setDateRange(7, "last7");
  }, []);

  useEffect(() => {
    loadData();
  }, [presetDate]);

  // Removed auto-fetch on date change - now only fetch on button clicks

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-100 dark:border-gray-600">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">AdReports</h1>
            <p className="text-gray-700 dark:text-gray-200 text-sm">Advanced Campaign Analytics</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {loginError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-3 text-lg">⚠️</span>
                    <div>
                      <p className="text-red-700 dark:text-red-400 text-sm font-semibold">Authentication Failed</p>
                      <p className="text-red-600 dark:text-red-500 text-xs mt-1">Please verify your credentials and try again</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loggingIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AdReports</h1>
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Campaign Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md"
                onClick={() => (window.location.href = "/daily-graphs")}
              >
                <span>📊</span>
                <span>Graphs</span>
              </button>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-md"
              >
                <span>Logout</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            
            {/* Account Selection */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Ad Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setTableData([]);
                  setOverview(null);
                  setAggregateData(null);
                }}
                className="w-48 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="default">Videonation</option>
                <option value="mms">MMS Account</option>
              </select>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Quick Ranges
              </label>
              <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange(7, "last7")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDailyRange === "last7" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange(10, "last10")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDailyRange === "last10" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                Last 10 Days
              </button>
              <button
                onClick={() => setDateRange(30, "last30")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDailyRange === "last30" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={setThisMonth}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDailyRange === "thisMonth" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

            {/* Custom Date Range */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dailyStartDate}
                  onChange={(e) => setDailyStartDate(e.target.value)}
                  className="w-36 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dailyEndDate}
                  onChange={(e) => setDailyEndDate(e.target.value)}
                  className="w-36 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    // Fetch both daily data and campaign performance data
                    fetchDailyData();
                    
                    // Also fetch campaign performance overview for the date range
                    const fetchCustomRangeData = async () => {
                      try {
                        const res = await fetch(`/api/custom?start=${dailyStartDate}&end=${dailyEndDate}&account=${selectedAccount}`);
                        const json = await res.json();
                        const data = json?.data || [];
                        
                        // Update overview with custom calculation
                        setOverview(calculateCustomOverview(data));
                      } catch (error) {
                        console.error('Error fetching custom range data:', error);
                      }
                    };
                    
                    fetchCustomRangeData();
                    setActiveDailyRange("custom");
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Custom Date Range Picker */}
      {mode === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={loadData}
              className="px-6 py-2 bg-blue-600 text-white rounded mt-4"
            >
              Fetch Data
            </button>
          </div>
        </div>
      )}

        {loading && (
          <div className="mb-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-800 dark:text-white font-semibold text-lg">Loading Analytics Data</p>
                <p className="text-blue-700 dark:text-gray-200 text-sm mt-1">Fetching campaign performance metrics...</p>
              </div>
            </div>
          </div>
        )}

      {!loading && (
        <>
        {/* Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Performance</h2>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Detailed analytics and metrics</p>
              </div>
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>📈</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-32">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Spend</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Impressions</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CPC</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CPM</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CTR</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Frequency</th>
                  {selectedAccount === "mms" ? (
                    <>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">App Install</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Purchase</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Registration</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Add to Cart</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Purchase</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Checkout</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Registration</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tableData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white w-32">
                      {item.date_start || item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right font-medium">
                      ₹{Math.round(item.spend).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {parseInt(item.impressions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {parseInt(item.clicks).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      ₹{Math.round(item.cpc).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      ₹{Math.round(item.cpm).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {parseFloat(item.ctr || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {(Math.round(item.frequency * 100) / 100).toFixed(2)}
                    </td>
                    {selectedAccount === "mms" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "mobile_app_install").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "complete_registration").toLocaleString()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "add_to_cart").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "initiate_checkout").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                          {getActionValue(item.actions, "complete_registration").toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                  
                {/* Aggregate/Total Row */}
                {aggregateData && (
                  <tr className="border-t-4 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white w-32">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      ₹{Math.round(aggregateData.spend).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {parseInt(aggregateData.impressions).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {parseInt(aggregateData.clicks).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      ₹{Math.round(aggregateData.cpc).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      ₹{Math.round(aggregateData.cpm).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {parseFloat(aggregateData.ctr || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {(Math.round(aggregateData.frequency * 100) / 100).toFixed(2)}
                    </td>
                    {selectedAccount === "mms" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "mobile_app_install").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "complete_registration").toLocaleString()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "add_to_cart").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "initiate_checkout").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                          {getActionValue(aggregateData.actions, "complete_registration").toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overview Cards - Moved below table */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {Object.entries(overview).map(([key, val]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-sm">📈</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {key === "average_ctr" || key === "frequency"
                    ? (Math.round(val * 100) / 100).toLocaleString()
                    : Math.round(val).toLocaleString()}
                </p>
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                  {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
