"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import ThemeToggle from '../components/ThemeToggle';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState("last3");
  const [analysis, setAnalysis] = useState("");
  const [analyzingData, setAnalyzingData] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("default");

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

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    setDailyStartDate(startOfMonth.toISOString().split('T')[0]);
    setDailyEndDate(yesterday.toISOString().split('T')[0]);
    setActiveRange("thisMonth");
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

  // Set default to last 3 days on component mount
  useEffect(() => {
    if (isAuthenticated) {
      setDateRange(3, "last3");
    }
  }, [isAuthenticated]);

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
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount
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
      
      // Analyze data with Gemini
      if (sortedData.length > 0) {
        analyzeDataWithGemini(sortedData);
      }
      
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
  }, [dailyStartDate, dailyEndDate, selectedAccount]);

  const generateChartData = (metric, label, color) => {
    const labels = chartData.map(item => item.date_start);
    const data = chartData.map(item => {
      if (metric === 'add_to_cart') return getActionValue(item.actions, 'add_to_cart');
      if (metric === 'purchase') return getActionValue(item.actions, 'purchase');
      if (metric === 'initiate_checkout') return getActionValue(item.actions, 'initiate_checkout');
      if (metric === 'complete_registration') return getActionValue(item.actions, 'complete_registration');
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Performance Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Configuration</h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Configure data source and date ranges</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Ad Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setChartData([]);
                  setAnalysis("");
                }}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="default">Videonation</option>
                <option value="mms">MMS Account</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Date Range Selection</h3>
          
          {/* Quick Date Range Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Quick Ranges
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setDateRange(3, "last3")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeRange === "last3" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                Last 3 Days
              </button>
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
              <button
                onClick={setThisMonth}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeRange === "thisMonth" 
                    ? "bg-blue-700 text-white shadow-lg" 
                    : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Start Date
              </label>
              <input
                type="date"
                value={dailyStartDate}
                onChange={(e) => setDailyStartDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                End Date
              </label>
              <input
                type="date"
                value={dailyEndDate}
                onChange={(e) => setDailyEndDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  fetchDailyData();
                  setActiveRange("custom");
                }}
                className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Update Charts
              </button>
            </div>
          </div>
        </div>

        {/* AI Performance Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Performance Insights</h2>
                <p className="text-sm text-gray-700 dark:text-gray-200">Powered by Gemini AI analytics</p>
              </div>
            </div>
            {analyzingData && (
              <div className="flex items-center space-x-3 text-purple-600 dark:text-purple-400">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Analyzing...</span>
              </div>
            )}
          </div>
          
          {analyzingData ? (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-8 text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-700 dark:text-purple-400 font-semibold text-lg">Analyzing Campaign Data</p>
              <p className="text-purple-600 dark:text-purple-500 text-sm mt-1">AI is processing your performance metrics...</p>
            </div>
          ) : analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.split('\n').filter(line => line.trim().startsWith('•')).map((insight, index) => {
                const cleanText = insight.replace(/[•*]/g, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600', 
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600',
                  'from-red-500 to-red-600'
                ];
                const icons = ['💰', '📈', '🎯', '⚡', '🚀'];
                
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colors[index % colors.length]} rounded-xl flex items-center justify-center mr-3 text-white text-sm font-bold group-hover:scale-110 transition-transform duration-200`}>
                        {index + 1}
                      </div>
                      <span className="text-2xl">{icons[index % icons.length]}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
                      {cleanText}
                    </p>
                  </div>
                );
              })}
              
              {analysis.split('\n').filter(line => line.trim().startsWith('•')).length === 0 && (
                <div className="col-span-full bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {analysis.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-semibold">Ready to Analyze Performance</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Select a date range to get AI-powered insights on your campaigns</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">Loading Analytics</p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm">Fetching performance data...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>

            {/* Conversions Chart */}
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                  data={generateChartData('add_to_cart', 'Add to Cart', '#06B6D4')}
                  options={{
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                  data={generateChartData('initiate_checkout', 'Initiate Checkout', '#84CC16')}
                  options={{
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
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
                    ...chartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}