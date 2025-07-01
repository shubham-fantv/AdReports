"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import ThemeToggle from '../components/ThemeToggle';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { subDays, format, parseISO } from "date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

export default function GraphsPage() {
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('default');

  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchDefaultChart();
  }, []);

  const fetchDefaultChart = async () => {
    setLoading(true);

    const end = new Date();
    const start = subDays(end, 27);
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    try {
      const res = await axios.get(
        `/api/custom?start=${startStr}&end=${endStr}`
      );
      const campaigns = res.data.data || [];

      // Map spends per date
      const dailySpendMap = {};
      campaigns.forEach((item) => {
        const date = item.date_start;
        if (!dailySpendMap[date]) {
          dailySpendMap[date] = 0;
        }
        dailySpendMap[date] += parseFloat(item.spend || 0);
      });

      // Split into 4 weeks
      const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const weeks = [[], [], [], []];
      let i = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = format(d, "yyyy-MM-dd");
        const dayLabel = dayMap[d.getDay()];
        const weekIndex = Math.floor(i / 7);
        weeks[weekIndex].push({
          day: dayLabel,
          spend: dailySpendMap[iso] || 0,
        });
        i++;
      }

      // Construct chart datasets
      const datasets = weeks.map((week, idx) => ({
        label: weekLabels[idx],
        data: week.map((d) => d.spend),
        borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][idx],
        fill: false,
        tension: 0.4,
      }));

      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      setChartData({
        labels,
        datasets,
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    }

    setLoading(false);
  };

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/custom?start=${startDate}&end=${endDate}`
      );
      const campaigns = res.data.data || [];

      // Construct chart data
      const dates = campaigns.map((c) => c.date_start);
      const spends = campaigns.map((c) => parseFloat(c.spend));

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "Spend",
            data: spends,
            fill: false,
            borderColor: "#3b82f6",
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Trends</h1>
                <p className="text-sm text-gray-700 dark:text-gray-200">Visual analytics dashboard</p>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Chart Configuration</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Ad Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="default">Videonation</option>
                <option value="mms">MMS Account</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button
              onClick={fetchGraphData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Generate Chart</span>
            </button>
            
            <button
              onClick={fetchDefaultChart}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-700 dark:text-blue-400 font-semibold text-lg">Generating Chart</p>
                <p className="text-blue-600 dark:text-blue-500 text-sm mt-1">Processing campaign data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        {chartData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Spend Trend Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">Campaign performance over selected date range</p>
            </div>
            
            <div className="h-96">
              <Line 
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map(dataset => ({
                    ...dataset,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: dataset.borderColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                  }))
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 14,
                          weight: '600'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#3b82f6',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(156, 163, 175, 0.2)',
                      },
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        },
                        font: {
                          size: 12
                        }
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(156, 163, 175, 0.2)',
                      },
                      ticks: {
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
