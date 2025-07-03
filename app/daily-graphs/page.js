"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DailyGraphs() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState("last7");
  const [analysis, setAnalysis] = useState("");
  const [analyzingData, setAnalyzingData] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("default");
  const [selectedLevel, setSelectedLevel] = useState("account");
  
  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!chartData.length) return { totalSpend: 0, totalPurchases: 0, costPerPurchase: 0 };
    
    const totalSpend = chartData.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
    const totalPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
    const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
    
    return { totalSpend, totalPurchases, costPerPurchase };
  };

  const getActionValue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || 0) : 0;
  };

  const setDateRange = (days, rangeKey) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1));
    
    setDailyStartDate(startDate.toISOString().split('T')[0]);
    setDailyEndDate(endDate.toISOString().split('T')[0]);
    setActiveRange(rangeKey);
  };


  // Check authentication on page load
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = "/";
    }
  }, []);

  // Set default to last 7 days on component mount
  useEffect(() => {
    if (isAuthenticated) {
      setDateRange(7, "last7");
    }
  }, [isAuthenticated]);

  // Trigger data fetch when date range is set and we have both dates
  useEffect(() => {
    if (isAuthenticated && dailyStartDate && dailyEndDate) {
      fetchDailyData();
    }
  }, [isAuthenticated, dailyStartDate, dailyEndDate]);

  const analyzeDataWithGemini = async (data) => {
    setAnalyzingData(true);
    try {
      const response = await fetch('/api/analyze-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chartData: data }),
      });
      
      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Error analyzing data:', error);
      setAnalysis('Error occurred while analyzing the data. Please try again.');
    }
    setAnalyzingData(false);
  };

  const fetchDailyData = async () => {
    setLoading(true);
    
    const startDate = new Date(dailyStartDate);
    const endDate = new Date(dailyEndDate);
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
      
      const allResults = await Promise.all(allPromises);
      
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      console.log("Graph data:", allCampaigns);
      const sortedData = allCampaigns.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
      setChartData(sortedData);

      // Fetch age breakdown data
      try {
        const ageFields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,actions"
          : "spend,impressions,clicks,actions";
          
        const ageParams = new URLSearchParams({
          start_date: dailyStartDate,
          end_date: dailyEndDate,
          per_day: "false",
          account: selectedAccount,
          level: selectedLevel,
          fields: ageFields,
          breakdowns: "age"
        });
        
        const ageResponse = await fetch(`/api/daily-reports?${ageParams}`);
        const ageResult = await ageResponse.json();
        
        if (ageResult?.data?.campaigns && Array.isArray(ageResult.data.campaigns)) {
          console.log("Age breakdown data:", ageResult.data.campaigns);
          console.log("First age item structure:", ageResult.data.campaigns[0]);
          console.log("Age field values:", ageResult.data.campaigns.map(item => ({ age: item.age, allKeys: Object.keys(item) })));
          setAgeData(ageResult.data.campaigns);
        } else {
          console.log("Age data campaigns is not an array or is missing:", ageResult);
          setAgeData([]);
        }
      } catch (error) {
        console.error("Error fetching age breakdown data:", error);
        setAgeData([]);
      }
      
      // AI analysis disabled for now
      // if (sortedData.length > 0) {
      //   analyzeDataWithGemini(sortedData);
      // }
      
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setChartData([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (dailyStartDate && dailyEndDate) {
      fetchDailyData();
    }
  }, [dailyStartDate, dailyEndDate, selectedAccount, selectedLevel]);

  const generateChartData = (metric, label, color) => {
    const labels = chartData.map(item => item.date_start);
    const data = chartData.map(item => {
      if (metric === 'add_to_cart') return getActionValue(item.actions, 'add_to_cart');
      if (metric === 'purchase') return getActionValue(item.actions, 'purchase');
      if (metric === 'initiate_checkout') return getActionValue(item.actions, 'initiate_checkout');
      if (metric === 'complete_registration') return getActionValue(item.actions, 'complete_registration');
      if (metric === 'cost_per_purchase') {
        const purchases = getActionValue(item.actions, 'purchase');
        const spend = parseFloat(item.spend || 0);
        return purchases > 0 ? spend / purchases : 0;
      }
      return parseFloat(item[metric] || 0);
    });

    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  const generateCampaignChartData = (metric, campaignData, color) => {
    const labels = campaignData.map(item => item.date_start);
    const data = campaignData.map(item => {
      if (metric === 'add_to_cart') return getActionValue(item.actions, 'add_to_cart');
      if (metric === 'purchase') return getActionValue(item.actions, 'purchase');
      if (metric === 'initiate_checkout') return getActionValue(item.actions, 'initiate_checkout');
      if (metric === 'complete_registration') return getActionValue(item.actions, 'complete_registration');
      if (metric === 'mobile_app_install') return getActionValue(item.actions, 'mobile_app_install');
      if (metric === 'cost_per_purchase') {
        const purchases = getActionValue(item.actions, 'purchase');
        const spend = parseFloat(item.spend || 0);
        return purchases > 0 ? spend / purchases : 0;
      }
      return parseFloat(item[metric] || 0);
    });

    return {
      labels,
      datasets: [
        {
          label: metric.charAt(0).toUpperCase() + metric.slice(1),
          data,
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  const generateAgeChartData = () => {
    if (!ageData.length) return null;

    // Define official Meta API age brackets
    const ageBrackets = {
      '13-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0,
      'unknown': 0
    };

    // Helper function to normalize age bracket from Meta API
    const normalizeAgeBracket = (age) => {
      if (!age) return 'unknown';
      
      // Age comes directly as bracket string like "45-54", just normalize the case
      const ageStr = age.toString().trim();
      
      // Check if it's a valid age bracket
      if (ageBrackets.hasOwnProperty(ageStr)) {
        return ageStr;
      }
      
      // Handle lowercase unknown
      if (ageStr.toLowerCase() === 'unknown') return 'unknown';
      
      return 'unknown';
    };

    // Aggregate purchases by age brackets
    ageData.forEach(item => {
      const age = item.age;
      const ageBracket = normalizeAgeBracket(age);
      
      // Look for purchase actions only
      const purchases = getActionValue(item.actions, 'purchase');
      
      console.log("Age processing:", { 
        ageBracket: age, 
        normalizedBracket: ageBracket, 
        purchases,
        actions: item.actions?.map(a => a.action_type),
        itemKeys: Object.keys(item)
      });
      
      ageBrackets[ageBracket] += purchases;
    });

    console.log("Final age brackets:", ageBrackets);

    // Convert to arrays and sort by purchase count
    const sortedBrackets = Object.entries(ageBrackets)
      .sort(([,a], [,b]) => b - a)
      .filter(([, purchases]) => purchases > 0); // Only show brackets with purchases

    const labels = sortedBrackets.map(([bracket]) => bracket);
    const data = sortedBrackets.map(([, purchases]) => purchases);

    return {
      labels,
      datasets: [
        {
          label: 'Purchases by Age Bracket',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',   // 13-17
            'rgba(54, 162, 235, 0.8)',   // 18-24
            'rgba(255, 205, 86, 0.8)',   // 25-34
            'rgba(75, 192, 192, 0.8)',   // 35-44
            'rgba(153, 102, 255, 0.8)',  // 45-54
            'rgba(255, 159, 64, 0.8)',   // 55-64
            'rgba(199, 199, 199, 0.8)',  // 65+
            'rgba(83, 102, 255, 0.8)'    // unknown
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getUniqueCampaigns = () => {
    if (selectedLevel !== "campaign" || !chartData.length) return [];
    
    const campaignMap = {};
    chartData.forEach(item => {
      if (item.campaign_name && !campaignMap[item.campaign_name]) {
        campaignMap[item.campaign_name] = [];
      }
      if (item.campaign_name) {
        campaignMap[item.campaign_name].push(item);
      }
    });
    
    return Object.entries(campaignMap)
      .map(([name, data]) => ({
        name,
        data: data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
      }))
      .filter(campaign => {
        // Calculate total spend for this campaign
        const totalSpend = campaign.data.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
        return totalSpend >= 100; // Only show campaigns with spend >= 100
      });
  };

  const getChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Daily Performance Metrics',
        color: theme === 'dark' ? '#ffffff' : '#374151',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme === 'dark' ? '#ffffff' : '#000000',
        bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
        borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: theme === 'dark' ? '#d1d5db' : '#6b7280',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: theme === 'dark' ? '#d1d5db' : '#6b7280',
          font: {
            size: 11
          }
        }
      }
    },
  });

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daily Analytics</h1>
                <p className="text-sm text-gray-700 dark:text-gray-200">Comprehensive performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-md"
              >
                <span>← Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Analytics Filters and Controls */}
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
                  setChartData([]);
                  setAnalysis("");
                }}
                className="w-48 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="default">Videonation</option>
                <option value="mms">MMS</option>
              </select>
            </div>

            {/* Level Selection */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setChartData([]);
                  setAnalysis("");
                }}
                className="w-40 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="account">Account</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Quick Ranges
              </label>
              <div className="flex flex-wrap gap-2">
                {/* <button
                  onClick={() => setDateRange(3, "last3")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeRange === "last3" 
                      ? "bg-blue-700 text-white shadow-lg" 
                      : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Last 3 Days
                </button> */}
                <button
                  onClick={() => setDateRange(7, "last7")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeRange === "last7" 
                      ? "bg-blue-700 text-white shadow-lg" 
                      : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setDateRange(10, "last10")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeRange === "last10" 
                      ? "bg-blue-700 text-white shadow-lg" 
                      : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Last 10 Days
                </button>
                <button
                  onClick={() => setDateRange(30, "last30")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeRange === "last30" 
                      ? "bg-blue-700 text-white shadow-lg" 
                      : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Last 30 Days
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
                    fetchDailyData();
                    setActiveRange("custom");
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight - Disabled */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">AI Insights:</span> Currently disabled
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {chartData.length > 0 && (() => {
          const { totalSpend, totalPurchases, costPerPurchase } = calculateSummaryMetrics();
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Spend Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Spend
                  </h3>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(totalSpend).toLocaleString()}
                </p>
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                  Total campaign spend
                </div>
              </div>

              {/* Total Purchases Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Purchases
                  </h3>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-sm">🛒</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPurchases.toLocaleString()}
                </p>
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                  Total conversions
                </div>
              </div>

              {/* Cost Per Purchase Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Cost Per Purchase
                  </h3>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(costPerPurchase).toLocaleString()}
                </p>
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                  Average cost per conversion
                </div>
              </div>
            </div>
          );
        })()}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">Loading Analytics</p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm">Fetching performance data...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && selectedLevel === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Purchases Chart - FIRST */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🛍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Purchases</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={generateChartData('purchase', 'Purchases', '#8B5CF6')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Cost per Purchase Chart - SECOND */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost per Purchase</h3>
              </div>
              <div className="h-64">
                <Line
                  data={generateChartData('cost_per_purchase', 'Cost per Purchase (₹)', '#EC4899')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Spend Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">₹</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Spend</h3>
              </div>
              <div className="h-64">
                <Line
                  data={generateChartData('spend', 'Spend (₹)', '#3B82F6')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Impressions Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👁</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Impressions</h3>
              </div>
              <div className="h-64">
                <Line
                  data={generateChartData('impressions', 'Impressions', '#10B981')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Clicks Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Clicks</h3>
              </div>
              <div className="h-64">
                <Line
                  data={generateChartData('clicks', 'Clicks', '#F59E0B')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* CTR Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">%</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Click-Through Rate</h3>
              </div>
              <div className="h-64">
                <Line
                  data={generateChartData('ctr', 'CTR (%)', '#EF4444')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Add to Cart Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🛒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add to Cart Events</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={generateChartData('add_to_cart', 'Add to Cart', '#0EA5E9')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Initiate Checkout Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">💳</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checkout Initiated</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={generateChartData('initiate_checkout', 'Initiate Checkout', '#22C55E')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Complete Registration Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👤</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Registrations</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={generateChartData('complete_registration', 'Complete Registration', '#F97316')}
                  options={{
                    ...getChartOptions(),
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...getChartOptions().plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Top Performing Age Brackets Chart */}
            {ageData.length > 0 && generateAgeChartData() && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Age Brackets Performance (Purchases)</h3>
                </div>
                <div className="h-64">
                  <Bar
                    data={generateAgeChartData()}
                    options={{
                      ...getChartOptions(),
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...getChartOptions().plugins,
                        legend: { display: false },
                        title: {
                          display: true,
                          text: 'Age Brackets by Purchase Count',
                          color: theme === 'dark' ? '#ffffff' : '#374151',
                          font: { size: 14, weight: 'bold' }
                        }
                      },
                      scales: {
                        ...getChartOptions().scales,
                        x: {
                          ...getChartOptions().scales.x,
                          title: {
                            display: true,
                            text: 'Age Brackets',
                            color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                          }
                        },
                        y: {
                          ...getChartOptions().scales.y,
                          title: {
                            display: true,
                            text: 'Number of Purchases',
                            color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Empty placeholder for odd number of charts to maintain grid layout */}
            {ageData.length > 0 && generateAgeChartData() && (
              <div></div>
            )}
          </div>
        )}

        {/* Campaign Level Charts */}
        {!loading && selectedLevel === "campaign" && (
          <div className="space-y-8">
            {getUniqueCampaigns().map((campaign, campaignIdx) => (
              <div key={campaign.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{campaign.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Campaign performance over time</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Conversions Chart - FIRST */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🛍</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedAccount === "mms" ? "App Installs" : "Purchases"}
                      </h4>
                    </div>
                    <div className="h-48">
                      <Line
                        data={generateCampaignChartData(
                          selectedAccount === "mms" ? 'mobile_app_install' : 'purchase', 
                          campaign.data, 
                          '#8B5CF6'
                        )}
                        options={{
                          ...getChartOptions(),
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...getChartOptions().plugins,
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Cost per Purchase Chart - SECOND */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-pink-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs">💰</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Cost per Purchase</h4>
                    </div>
                    <div className="h-48">
                      <Line
                        data={generateCampaignChartData('cost_per_purchase', campaign.data, '#EC4899')}
                        options={{
                          ...getChartOptions(),
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...getChartOptions().plugins,
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Spend Chart */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">₹</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Spend</h4>
                    </div>
                    <div className="h-48">
                      <Line
                        data={generateCampaignChartData('spend', campaign.data, '#3B82F6')}
                        options={{
                          ...getChartOptions(),
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...getChartOptions().plugins,
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Impressions Chart */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs">👁</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Impressions</h4>
                    </div>
                    <div className="h-48">
                      <Line
                        data={generateCampaignChartData('impressions', campaign.data, '#10B981')}
                        options={{
                          ...getChartOptions(),
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...getChartOptions().plugins,
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Clicks Chart */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🔗</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Clicks</h4>
                    </div>
                    <div className="h-48">
                      <Line
                        data={generateCampaignChartData('clicks', campaign.data, '#F59E0B')}
                        options={{
                          ...getChartOptions(),
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            ...getChartOptions().plugins,
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {getUniqueCampaigns().length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Campaign Data</h3>
                <p className="text-gray-600 dark:text-gray-400">Select a date range to view campaign-level analytics</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}