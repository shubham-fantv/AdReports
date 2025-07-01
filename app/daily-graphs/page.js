"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📈 Daily Reports Graphs</h1>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 bg-gray-600 rounded text-white cursor-pointer hover:bg-gray-700 transition"
        >
          ← Back to Dashboard
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
            setChartData([]);
            setAnalysis("");
          }}
          className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="default">Videonation</option>
          <option value="mms">MMS Account</option>
        </select>
      </div>

      {/* Date Range Controls */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Quick Date Ranges
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange(3, "last3")}
              className={`px-3 py-1 rounded text-sm transition ${
                activeRange === "last3" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Last 3 Days
            </button>
            <button
              onClick={() => setDateRange(7, "last7")}
              className={`px-3 py-1 rounded text-sm transition ${
                activeRange === "last7" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange(10, "last10")}
              className={`px-3 py-1 rounded text-sm transition ${
                activeRange === "last10" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Last 10 Days
            </button>
            <button
              onClick={() => setDateRange(30, "last30")}
              className={`px-3 py-1 rounded text-sm transition ${
                activeRange === "last30" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={setThisMonth}
              className={`px-3 py-1 rounded text-sm transition ${
                activeRange === "thisMonth" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dailyStartDate}
              onChange={(e) => setDailyStartDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dailyEndDate}
              onChange={(e) => setDailyEndDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                fetchDailyData();
                setActiveRange("custom");
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded w-full"
            >
              Update Graphs
            </button>
          </div>
        </div>
      </div>

      {/* AI Performance Insights */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Performance Insights</h2>
              <p className="text-sm text-gray-500">AI-powered analysis by Gemini</p>
            </div>
          </div>
          {analyzingData && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          )}
        </div>
        
        {analyzingData ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing your campaign data...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.split('\n').filter(line => line.trim().startsWith('•')).map((insight, index) => {
              // Clean the text from markdown and bullet points
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
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors[index]} rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold`}>
                      {index + 1}
                    </div>
                    <span className="text-2xl">{icons[index]}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    {cleanText}
                  </p>
                </div>
              );
            })}
            
            {analysis.split('\n').filter(line => line.trim().startsWith('•')).length === 0 && (
              <div className="col-span-full bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-gray-700 leading-relaxed">
                  {analysis.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-gray-600 font-medium">Ready to analyze your campaign performance</p>
            <p className="text-gray-500 text-sm mt-1">Select a date range above to get AI-powered insights</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spend Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Spend</h3>
            <Line
              data={generateChartData('spend', 'Spend ($)', '#3B82F6')}
              options={chartOptions}
            />
          </div>

          {/* Impressions Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Impressions</h3>
            <Line
              data={generateChartData('impressions', 'Impressions', '#10B981')}
              options={chartOptions}
            />
          </div>

          {/* Clicks Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Clicks</h3>
            <Line
              data={generateChartData('clicks', 'Clicks', '#F59E0B')}
              options={chartOptions}
            />
          </div>

          {/* CTR Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily CTR</h3>
            <Line
              data={generateChartData('ctr', 'CTR (%)', '#EF4444')}
              options={chartOptions}
            />
          </div>

          {/* Conversions Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Purchases</h3>
            <Bar
              data={generateChartData('purchase', 'Purchases', '#8B5CF6')}
              options={chartOptions}
            />
          </div>

          {/* Add to Cart Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Add to Cart</h3>
            <Bar
              data={generateChartData('add_to_cart', 'Add to Cart', '#06B6D4')}
              options={chartOptions}
            />
          </div>

          {/* Initiate Checkout Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Initiate Checkout</h3>
            <Bar
              data={generateChartData('initiate_checkout', 'Initiate Checkout', '#84CC16')}
              options={chartOptions}
            />
          </div>

          {/* Complete Registration Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Daily Complete Registration</h3>
            <Bar
              data={generateChartData('complete_registration', 'Complete Registration', '#F97316')}
              options={chartOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}