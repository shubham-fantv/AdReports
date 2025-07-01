"use client";
import { useEffect, useState } from "react";

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

  const setDateRange = (days, rangeKey) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // Yesterday
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1)); // Get exactly 'days' number of days
    
    setDailyStartDate(startDate.toISOString().split('T')[0]);
    setDailyEndDate(endDate.toISOString().split('T')[0]);
    setActiveDailyRange(rangeKey);
  };

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    setDailyStartDate(startOfMonth.toISOString().split('T')[0]);
    setDailyEndDate(yesterday.toISOString().split('T')[0]);
    setActiveDailyRange("thisMonth");
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

  useEffect(() => {
    // Auto-fetch daily data when dates are set
    if (mode === "daily" && dailyStartDate && dailyEndDate) {
      fetchDailyData();
    }
  }, [dailyStartDate, dailyEndDate, mode]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md w-96 border border-gray-200">
          {/* Header */}
          <div className="p-6 text-center border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📊</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">AdDashboard</h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>
          
          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {loginError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">⚠️</span>
                    <div>
                      <p className="text-red-700 text-sm font-medium">Login Failed</p>
                      <p className="text-red-600 text-xs mt-1">Please check your credentials and try again</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 AdDashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Account Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Facebook Ad Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => {
            setSelectedAccount(e.target.value);
            // Clear data when switching accounts
            setTableData([]);
            setOverview(null);
            setAggregateData(null);
          }}
          className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="default">Videonation</option>
          <option value="mms">MMS Account</option>
        </select>
      </div>

      {/* Toggle Mode */}
      <div className="flex gap-4 mb-6 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("daily");
              setTableData([]);
              setOverview(null);
            }}
            className={`px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition ${
              mode === "daily" ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            Daily Reports
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-green-600 rounded text-white cursor-pointer hover:bg-green-700 transition"
            onClick={() => (window.location.href = "/daily-graphs")}
          >
            Daily Graphs 📊
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      {mode === "preset" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Date Preset
          </label>
          <select
            value={presetDate}
            onChange={(e) => setPresetDate(e.target.value)}
            className="p-2 rounded border w-full"
          >
            {presets.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Daily Reports Selector */}
      {mode === "daily" && (
        <div className="mb-6">
          {/* Quick Date Range Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Quick Date Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange(7, "last7")}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeDailyRange === "last7" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange(10, "last10")}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeDailyRange === "last10" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Last 10 Days
              </button>
              <button
                onClick={() => setDateRange(30, "last30")}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeDailyRange === "last30" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={setThisMonth}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeDailyRange === "thisMonth" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Date Range Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dailyStartDate}
                onChange={(e) => setDailyStartDate(e.target.value)}
                className="p-2 rounded border w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dailyEndDate}
                onChange={(e) => setDailyEndDate(e.target.value)}
                className="p-2 rounded border w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Show Per Day Breakdown
              </label>
              <div className="flex items-center p-2">
                <input
                  type="checkbox"
                  id="perDay"
                  checked={perDay}
                  onChange={(e) => setPerDay(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="perDay" className="text-sm">
                  Show metrics per day
                </label>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              fetchDailyData();
              setActiveDailyRange("custom");
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded mt-4"
          >
            Done
          </button>
        </div>
      )}

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
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-blue-700 font-medium">Loading campaign data...</p>
              <p className="text-blue-600 text-sm">Please wait while we fetch your reports</p>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Overview if preset */}
          {overview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(overview).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-white p-4 rounded shadow text-center"
                >
                  <h2 className="text-sm text-gray-500 uppercase">
                    {key.replace(/_/g, " ")}
                  </h2>
                  <p className="text-lg font-semibold">
                    {key == "average_ctr" || key == "frequency"
                      ? Math.round(val * 100) / 100
                      : Math.round(val)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Campaign Performance</h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
              >
                📊 Export CSV
              </button>
            </div>
            <div className="overflow-auto">
              <table className="w-full table-auto border border-gray-200 text-center">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Spend</th>
                    <th className="px-4 py-2">Impressions</th>
                    <th className="px-4 py-2">Clicks</th>
                    <th className="px-4 py-2">CPC</th>
                    <th className="px-4 py-2">CPM</th>
                    <th className="px-4 py-2">CTR</th>
                    <th className="px-4 py-2">Frequency</th>
                    {selectedAccount === "mms" ? (
                      <>
                        <th className="px-4 py-2">Mobile App Install</th>
                        <th className="px-4 py-2">Purchase</th>
                        <th className="px-4 py-2">Complete Registration</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-2">Add to Cart</th>
                        <th className="px-4 py-2">Purchase</th>
                        <th className="px-4 py-2">Initiate Checkout</th>
                        <th className="px-4 py-2">Complete Registration</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, idx) => (
                    <tr key={idx} className="border-t text-sm text-gray-700">
                      <td className="px-4 py-2">
                        {item.date_start || item.date}
                      </td>
                      <td className="px-4 py-2">{Math.round(item.spend)}</td>
                      <td className="px-4 py-2">{item.impressions}</td>
                      <td className="px-4 py-2">{item.clicks}</td>
                      <td className="px-4 py-2">{Math.round(item.cpc)}</td>
                      <td className="px-4 py-2">{Math.round(item.cpm)}</td>
                      <td className="px-4 py-2">
                        {parseFloat(item.ctr || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {Math.round(item.frequency * 100) / 100}
                      </td>
                      {selectedAccount === "mms" ? (
                        <>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "mobile_app_install")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "purchase")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "complete_registration")}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "add_to_cart")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "purchase")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "initiate_checkout")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(item.actions, "complete_registration")}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  
                  {/* Aggregate/Total Row */}
                  {console.log("Checking aggregateData in render:", aggregateData)}
                  {aggregateData && (
                    <tr className="border-t-2 border-blue-600 bg-blue-50 text-sm font-semibold text-blue-800">
                      <td className="px-4 py-2">
                        {aggregateData.campaign_name || `TOTAL (${dailyStartDate} to ${dailyEndDate})`}
                      </td>
                      <td className="px-4 py-2">{Math.round(aggregateData.spend)}</td>
                      <td className="px-4 py-2">{aggregateData.impressions}</td>
                      <td className="px-4 py-2">{aggregateData.clicks}</td>
                      <td className="px-4 py-2">{Math.round(aggregateData.cpc)}</td>
                      <td className="px-4 py-2">{Math.round(aggregateData.cpm)}</td>
                      <td className="px-4 py-2">
                        {parseFloat(aggregateData.ctr || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {Math.round(aggregateData.frequency * 100) / 100}
                      </td>
                      {selectedAccount === "mms" ? (
                        <>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "mobile_app_install")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "purchase")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "complete_registration")}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "add_to_cart")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "purchase")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "initiate_checkout")}
                          </td>
                          <td className="px-4 py-2">
                            {getActionValue(aggregateData.actions, "complete_registration")}
                          </td>
                        </>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
