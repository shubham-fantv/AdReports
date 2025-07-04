"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Import our custom components and utilities
import { 
  MmsPerformanceCards, 
  VideoNationPerformanceCards, 
  SummaryCards 
} from './PerformanceCards';
import { 
  AgeSpendPieChart,
  AgePurchasePieChart, 
  GenderPurchasePieChart,
  GenderSpendPieChart, 
  SpendVsPurchaseLineChart, 
  SideBySideCharts,
  IndividualMetricsGrid,
  DeviceBreakdownTable
} from './ChartComponents';
import { 
  generateLineChartData, 
  generateCampaignChartData, 
  generateAgeChartData, 
  generateSpendVsPurchaseChartData, 
  generateSpendVsPurchaseScatterData, 
  generateClicksVsCtrChartData, 
  generateAgeSpendPieChartData,
  generateAgePurchasePieChartData, 
  generateGenderPurchasePieChartData,
  generateGenderSpendPieChartData,
  generateIndividualMetricChart
} from './chartDataGenerators';
import { 
  calculateSummaryMetrics, 
  calculateMmsMetrics, 
  getActionValue, 
  getUniqueCampaigns 
} from './metricsCalculators';
import { 
  getChartOptions, 
  getDualAxisChartOptions, 
  getScatterChartOptions, 
  getBarWithLineChartOptions 
} from './chartOptions';
import { setDateRange, getDefaultDateRange } from './dateUtils';
import { fetchDailyData } from './apiUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DailyGraphsPage() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState("last7");
  const [analysis, setAnalysis] = useState("");
  const [analyzingData, setAnalyzingData] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("default");
  const [selectedLevel, setSelectedLevel] = useState("account");

  // Initialize default date range
  useEffect(() => {
    const defaultRange = getDefaultDateRange();
    setDailyStartDate(defaultRange.startDate);
    setDailyEndDate(defaultRange.endDate);
  }, []);

  // Check authentication
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      window.location.href = '/';
    }
  }, []);

  // Fetch data when dates or selection changes
  useEffect(() => {
    if (dailyStartDate && dailyEndDate && isAuthenticated) {
      handleFetchDailyData();
    }
  }, [dailyStartDate, dailyEndDate, selectedAccount, selectedLevel, isAuthenticated]);

  const handleFetchDailyData = () => {
    fetchDailyData(
      dailyStartDate,
      dailyEndDate,
      selectedAccount,
      selectedLevel,
      setChartData,
      setAgeData,
      setGenderData,
      setDeviceData,
      setLoading
    );
  };

  const handleSetDateRange = (days, rangeKey) => {
    setDateRange(days, rangeKey, setDailyStartDate, setDailyEndDate, setActiveRange);
  };

  // Create wrapped functions that include necessary dependencies
  const wrappedCalculateSummaryMetrics = () => calculateSummaryMetrics(chartData, getActionValue);
  const wrappedCalculateMmsMetrics = () => calculateMmsMetrics(chartData, getActionValue);
  const wrappedGenerateAgeSpendPieChartData = () => generateAgeSpendPieChartData(ageData);
  const wrappedGenerateAgePurchasePieChartData = () => generateAgePurchasePieChartData(ageData, getActionValue);
  const wrappedGenerateGenderPurchasePieChartData = () => generateGenderPurchasePieChartData(genderData, getActionValue);
  const wrappedGenerateGenderSpendPieChartData = () => generateGenderSpendPieChartData(genderData);
  const wrappedGenerateSpendVsPurchaseChartData = () => generateSpendVsPurchaseChartData(chartData, getActionValue);
  const wrappedGenerateSpendVsPurchaseScatterData = () => generateSpendVsPurchaseScatterData(chartData, getActionValue);
  const wrappedGenerateClicksVsCtrChartData = () => generateClicksVsCtrChartData(chartData);

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
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="default">VideoNation</option>
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
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="account">Account</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>

            {/* Date Range Quick Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Last 7 days", days: 7, key: "last7" },
                { label: "Last 14 days", days: 14, key: "last14" },
                { label: "Last 30 days", days: 30, key: "last30" },
              ].map(range => (
                <button
                  key={range.key}
                  onClick={() => handleSetDateRange(range.days, range.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeRange === range.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Date Range Picker */}
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dailyStartDate}
                  onChange={(e) => setDailyStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dailyEndDate}
                  onChange={(e) => setDailyEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    handleFetchDailyData();
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

        {/* VideoNation Cards - Only show for default account and account level */}
        {selectedAccount === "default" && selectedLevel === "account" && chartData.length > 0 && (
          <VideoNationPerformanceCards 
            chartData={chartData} 
            calculateSummaryMetrics={wrappedCalculateSummaryMetrics}
          />
        )}

        {/* MMS Cards - Only show for MMS account and account level */}
        {selectedAccount === "mms" && selectedLevel === "account" && chartData.length > 0 && (
          <MmsPerformanceCards 
            chartData={chartData} 
            calculateMmsMetrics={wrappedCalculateMmsMetrics}
          />
        )}


        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">Loading Analytics</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Please wait while we fetch your data...</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Individual Metrics Grid - Show for account level only */}
        {selectedLevel === "account" && chartData.length > 0 && (
          <IndividualMetricsGrid 
            chartData={chartData} 
            generateIndividualMetricChart={generateIndividualMetricChart}
            getActionValue={getActionValue}
            getChartOptions={getChartOptions}
            theme={theme}
            accountType={selectedAccount}
          />
        )}

        {/* Device Breakdown Table - Only show for VideoNation account and account level */}
        {selectedAccount === "default" && selectedLevel === "account" && deviceData.length > 0 && (
          <div className="mb-8">
            <DeviceBreakdownTable 
              deviceData={deviceData} 
              getActionValue={getActionValue}
              theme={theme}
            />
          </div>
        )}

        {/* Spend vs Purchase Chart - Only show for MMS account and account level */}
        {selectedAccount === "mms" && selectedLevel === "account" && chartData.length > 0 && (
          <SpendVsPurchaseLineChart 
            chartData={chartData} 
            generateSpendVsPurchaseChartData={wrappedGenerateSpendVsPurchaseChartData}
            getDualAxisChartOptions={getDualAxisChartOptions}
            theme={theme}
          />
        )}

        {/* Side-by-Side Charts - Only show for MMS account and account level */}
        {selectedAccount === "mms" && selectedLevel === "account" && chartData.length > 0 && (
          <SideBySideCharts 
            chartData={chartData} 
            generateSpendVsPurchaseScatterData={wrappedGenerateSpendVsPurchaseScatterData}
            generateClicksVsCtrChartData={wrappedGenerateClicksVsCtrChartData}
            getScatterChartOptions={getScatterChartOptions}
            getBarWithLineChartOptions={getBarWithLineChartOptions}
            theme={theme}
          />
        )}

        {/* Audience Breakdown - Only show for MMS account and account level */}
        {selectedAccount === "mms" && selectedLevel === "account" && (ageData.length > 0 || genderData.length > 0) && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  Audience Breakdown
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Demographic analysis of advertising performance and spend distribution</p>
              </div>

              {/* Age Charts Side by Side */}
              {ageData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Age Spend Distribution Pie Chart */}
                  <AgeSpendPieChart 
                    ageData={ageData} 
                    generateAgeSpendPieChartData={wrappedGenerateAgeSpendPieChartData}
                    theme={theme}
                  />

                  {/* Age Purchase Distribution Pie Chart */}
                  <AgePurchasePieChart 
                    ageData={ageData} 
                    generateAgePurchasePieChartData={wrappedGenerateAgePurchasePieChartData}
                    theme={theme}
                  />
                </div>
              )}

              {/* Gender Charts Side by Side */}
              {genderData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gender Spend Distribution Pie Chart */}
                  <GenderSpendPieChart 
                    genderData={genderData} 
                    generateGenderSpendPieChartData={wrappedGenerateGenderSpendPieChartData}
                    theme={theme}
                  />

                  {/* Gender Purchase Distribution Pie Chart */}
                  <GenderPurchasePieChart 
                    genderData={genderData} 
                    generateGenderPurchasePieChartData={wrappedGenerateGenderPurchasePieChartData}
                    theme={theme}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VideoNation Cards - Campaign Level */}
        {selectedAccount === "default" && selectedLevel === "campaign" && chartData.length > 0 && (
          <VideoNationPerformanceCards 
            chartData={chartData} 
            calculateSummaryMetrics={wrappedCalculateSummaryMetrics}
          />
        )}


        {/* Campaign Level Charts */}
        {selectedLevel === "campaign" && chartData.length > 0 && (
          <div className="space-y-6">

            {/* Individual Campaign Charts */}
            {getUniqueCampaigns(chartData, selectedLevel)
              .filter(campaign => {
                // Filter out campaigns with zero spend across entire date range
                const totalSpend = campaign.data.reduce((sum, item) => sum + (parseFloat(item.spend) || 0), 0);
                return totalSpend > 0;
              })
              .map(campaign => {
              // Define metrics for campaign level based on account type
              const getCampaignMetrics = () => {
                const baseMetrics = [
                  { key: 'purchases', title: 'Purchases', icon: '🛒', color: '#8b5cf6' },
                  { key: 'cost_per_purchase', title: 'Cost Per Purchase', icon: '💰', color: '#10b981' },
                  { key: 'spend', title: 'Spend', icon: '💳', color: '#ef4444' },
                  { key: 'impressions', title: 'Impressions', icon: '👁️', color: '#22c55e' },
                  { key: 'clicks', title: 'Clicks', icon: '🔗', color: '#3b82f6' },
                  { key: 'ctr', title: 'CTR', icon: '📈', color: '#f59e0b' },
                  { key: 'user_registrations', title: 'Registrations', icon: '👤', color: '#ec4899' }
                ];

                if (selectedAccount === "mms") {
                  return [...baseMetrics, { key: 'app_install', title: 'App Install', icon: '📱', color: '#a855f7' }];
                } else {
                  return [...baseMetrics, { key: 'add_to_cart', title: 'Add to Cart', icon: '🛍️', color: '#a855f7' }];
                }
              };

              const metrics = getCampaignMetrics();

              return (
                <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Campaign ID: {campaign.id}</p>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {campaign.data.length} data points
                    </div>
                  </div>
                  
                  {/* All 8 Charts in 2 Rows of 4 Each */}
                  <div className="space-y-6">
                    {/* Row 1: First 4 metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {metrics.slice(0, 4).map(metric => (
                        <div key={metric.key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                          <div className="flex items-center mb-4">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2`} style={{ backgroundColor: metric.color }}>
                              <span className="text-white text-xs">{metric.icon}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{metric.title}</h4>
                          </div>
                          <div className="h-48">
                            <Line
                              data={generateCampaignChartData(metric.key, campaign.data, metric.color)}
                              options={{
                                ...getChartOptions(theme),
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  ...getChartOptions(theme).plugins,
                                  legend: { display: false },
                                  title: { display: false }
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Row 2: Last 4 metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {metrics.slice(4, 8).map(metric => (
                        <div key={metric.key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                          <div className="flex items-center mb-4">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2`} style={{ backgroundColor: metric.color }}>
                              <span className="text-white text-xs">{metric.icon}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{metric.title}</h4>
                          </div>
                          <div className="h-48">
                            <Line
                              data={generateCampaignChartData(metric.key, campaign.data, metric.color)}
                              options={{
                                ...getChartOptions(theme),
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  ...getChartOptions(theme).plugins,
                                  legend: { display: false },
                                  title: { display: false }
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getUniqueCampaigns(chartData, selectedLevel)
              .filter(campaign => {
                const totalSpend = campaign.data.reduce((sum, item) => sum + (parseFloat(item.spend) || 0), 0);
                return totalSpend > 0;
              }).length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Campaigns</h3>
                <p className="text-gray-600 dark:text-gray-400">No campaigns with spend found for the selected date range</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}