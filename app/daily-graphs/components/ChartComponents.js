"use client";
import { Line, Bar, Scatter, Pie } from "react-chartjs-2";

// Chart Components

export const AgeSpendPieChart = ({ ageData, generateAgeSpendPieChartData, theme }) => {
  if (!ageData.length) return null;

  const ageSpendPieData = generateAgeSpendPieChartData();
  if (!ageSpendPieData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spend Distribution by Age Groups</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pie chart showing advertising spend allocation across different age demographics</p>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Total Age Groups: {ageSpendPieData.labels.length}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 h-80">
          <Pie
            data={ageSpendPieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                  bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Age Group Breakdown</h4>
          <div className="space-y-3">
            {ageSpendPieData.labels.map((label, index) => {
              const value = ageSpendPieData.datasets[0].data[index];
              const total = ageSpendPieData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              const color = ageSpendPieData.datasets[0].backgroundColor[index];
              
              return (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label} years
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgePurchasePieChart = ({ ageData, generateAgePurchasePieChartData, theme }) => {
  if (!ageData.length) return null;

  const agePurchasePieData = generateAgePurchasePieChartData();
  if (!agePurchasePieData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Distribution by Age Groups</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pie chart showing purchase conversions across different age demographics</p>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Total Age Groups: {agePurchasePieData.labels.length}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 h-80">
          <Pie
            data={agePurchasePieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                  bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value.toLocaleString()} purchases (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Age Group Breakdown</h4>
          <div className="space-y-3">
            {agePurchasePieData.labels.map((label, index) => {
              const value = agePurchasePieData.datasets[0].data[index];
              const total = agePurchasePieData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              const color = agePurchasePieData.datasets[0].backgroundColor[index];
              
              return (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label} years
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {value.toLocaleString()} purchases
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GenderPurchasePieChart = ({ genderData, generateGenderPurchasePieChartData, theme }) => {
  if (!genderData.length) return null;

  const genderPurchasePieData = generateGenderPurchasePieChartData();
  if (!genderPurchasePieData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Distribution by Gender</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pie chart showing purchase conversions across different gender demographics</p>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Total Genders: {genderPurchasePieData.labels.length}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 h-80">
          <Pie
            data={genderPurchasePieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                  bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value.toLocaleString()} purchases (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Gender Breakdown</h4>
          <div className="space-y-3">
            {genderPurchasePieData.labels.map((label, index) => {
              const value = genderPurchasePieData.datasets[0].data[index];
              const total = genderPurchasePieData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              const color = genderPurchasePieData.datasets[0].backgroundColor[index];
              
              return (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {value.toLocaleString()} purchases
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GenderSpendPieChart = ({ genderData, generateGenderSpendPieChartData, theme }) => {
  if (!genderData.length) return null;

  const genderSpendPieData = generateGenderSpendPieChartData();
  if (!genderSpendPieData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spend Distribution by Gender</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pie chart showing advertising spend allocation across different gender demographics</p>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Total Genders: {genderSpendPieData.labels.length}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 h-80">
          <Pie
            data={genderSpendPieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                  bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Gender Breakdown</h4>
          <div className="space-y-3">
            {genderSpendPieData.labels.map((label, index) => {
              const value = genderSpendPieData.datasets[0].data[index];
              const total = genderSpendPieData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              const color = genderSpendPieData.datasets[0].backgroundColor[index];
              
              return (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SpendVsPurchaseLineChart = ({ chartData, generateSpendVsPurchaseChartData, getDualAxisChartOptions, theme }) => {
  if (!chartData.length) return null;

  const spendVsPurchaseData = generateSpendVsPurchaseChartData();
  if (!spendVsPurchaseData) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spend vs Purchases Over Time</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daily comparison of advertising spend and purchase conversions</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Spend (₹)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Purchases</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <Line
          data={spendVsPurchaseData}
          options={getDualAxisChartOptions(theme)}
        />
      </div>
    </div>
  );
};

export const SideBySideCharts = ({ 
  chartData, 
  generateSpendVsPurchaseScatterData, 
  generateClicksVsCtrChartData, 
  getScatterChartOptions, 
  getBarWithLineChartOptions, 
  theme 
}) => {
  if (!chartData.length) return null;

  const scatterData = generateSpendVsPurchaseScatterData();
  const clicksVsCtrData = generateClicksVsCtrChartData();
  if (!scatterData || !clicksVsCtrData) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Spend vs Purchase Scatter Plot */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
        <div className="flex flex-col mb-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spend vs Purchases Correlation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Scatter plot showing correlation between daily spend and purchase conversions</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Daily Performance</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Trend Line</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <Scatter
            data={scatterData}
            options={getScatterChartOptions(theme)}
          />
        </div>
      </div>

      {/* Clicks vs CTR Dual-Axis Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
        <div className="flex flex-col mb-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Clicks vs Click-Through Rate</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bar chart for daily clicks with CTR line overlay showing engagement performance</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Daily Clicks</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">CTR (%)</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <Bar
            data={clicksVsCtrData}
            options={getBarWithLineChartOptions(theme)}
          />
        </div>
      </div>

    </div>
  );
};

// Individual Metric Charts - Separate Charts
export const IndividualMetricsGrid = ({ 
  chartData, 
  generateIndividualMetricChart, 
  getActionValue, 
  getChartOptions, 
  theme,
  accountType = "default" 
}) => {
  if (!chartData.length) return null;

  // Define metrics to show - 8 metrics with account-specific variations
  const getMetricsToShow = () => {
    const baseMetrics = [
      { key: 'purchases', title: 'Daily Purchases', icon: '🛒', color: 'from-purple-500 to-purple-600', borderColor: 'rgb(139, 92, 246)' },
      { key: 'cost_per_purchase', title: 'Cost Per Purchase', icon: '💰', color: 'from-teal-500 to-teal-600', borderColor: 'rgb(16, 185, 129)' },
      { key: 'spend', title: 'Daily Spend', icon: '💳', color: 'from-red-500 to-red-600', borderColor: 'rgb(239, 68, 68)' },
      { key: 'impressions', title: 'Daily Impressions', icon: '👁️', color: 'from-green-500 to-green-600', borderColor: 'rgb(34, 197, 94)' },
      { key: 'clicks', title: 'Daily Clicks', icon: '🔗', color: 'from-blue-500 to-blue-600', borderColor: 'rgb(59, 130, 246)' },
      { key: 'ctr', title: 'Click Through Rate', icon: '📈', color: 'from-yellow-500 to-yellow-600', borderColor: 'rgb(245, 158, 11)' },
      { key: 'user_registrations', title: 'User Registrations', icon: '👤', color: 'from-pink-500 to-pink-600', borderColor: 'rgb(236, 72, 153)' }
    ];

    // Add account-specific 7th metric
    if (accountType === "mms") {
      return [
        ...baseMetrics,
        { key: 'app_install', title: 'App Install', icon: '📱', color: 'from-violet-500 to-violet-600', borderColor: 'rgb(168, 85, 247)' }
      ];
    } else {
      // VideoNation
      return [
        ...baseMetrics,
        { key: 'add_to_cart', title: 'Add to Cart', icon: '🛍️', color: 'from-violet-500 to-violet-600', borderColor: 'rgb(168, 85, 247)' }
      ];
    }
  };

  const metrics = getMetricsToShow();

  // Group metrics into rows of 2
  const metricRows = [];
  for (let i = 0; i < metrics.length; i += 2) {
    metricRows.push(metrics.slice(i, i + 2));
  }

  return (
    <div className="space-y-8 mb-8">
      {metricRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {row.map(metric => {
            const chartData_individual = generateIndividualMetricChart(chartData, metric.key, getActionValue);
            if (!chartData_individual) return null;
            
            return (
              <div key={metric.key} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center mr-4`}>
                      <span className="text-white text-lg">{metric.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{metric.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daily performance trend over the selected period</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {chartData.length} data points
                  </div>
                </div>
                
                <div className="h-80">
                  <Line
                    data={chartData_individual}
                    options={{
                      ...getChartOptions(theme),
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...getChartOptions(theme).plugins,
                        legend: { 
                          display: true,
                          labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: {
                              size: 12,
                              weight: 'bold',
                            },
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                          },
                        },
                        title: { 
                          display: true,
                          text: `${metric.title} Performance`,
                          font: {
                            size: 16,
                            weight: 'bold',
                          },
                          color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                        }
                      },
                      scales: {
                        x: {
                          ...getChartOptions(theme).scales?.x,
                          title: { 
                            display: true,
                            text: 'Date',
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                          }
                        },
                        y: {
                          ...getChartOptions(theme).scales?.y,
                          title: { 
                            display: true,
                            text: chartData_individual.datasets[0].label,
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Device Breakdown Table Component
export const DeviceBreakdownTable = ({ deviceData, getActionValue, theme }) => {
  if (!deviceData.length) return null;

  // Define device platform categories
  const deviceCategories = {
    'desktop': { spend: 0, purchases: 0, clicks: 0, impressions: 0 },
    'mobile_app': { spend: 0, purchases: 0, clicks: 0, impressions: 0 },
    'mobile_web': { spend: 0, purchases: 0, clicks: 0, impressions: 0 },
    'unknown': { spend: 0, purchases: 0, clicks: 0, impressions: 0 }
  };

  // Helper function to normalize device platform from Meta API
  const normalizeDevicePlatform = (device) => {
    if (!device) return 'unknown';
    
    const deviceStr = device.toString().toLowerCase().trim();
    
    if (deviceCategories.hasOwnProperty(deviceStr)) {
      return deviceStr;
    }
    
    return 'unknown';
  };

  // Aggregate data by device platform
  deviceData.forEach(item => {
    const device = item.device_platform;
    const deviceCategory = normalizeDevicePlatform(device);
    const spend = parseFloat(item.spend || 0);
    const purchases = getActionValue(item.actions, 'purchase');
    const clicks = parseFloat(item.clicks || 0);
    const impressions = parseFloat(item.impressions || 0);
    
    deviceCategories[deviceCategory].spend += spend;
    deviceCategories[deviceCategory].purchases += purchases;
    deviceCategories[deviceCategory].clicks += clicks;
    deviceCategories[deviceCategory].impressions += impressions;
  });

  // Filter out devices with no data and prepare rows
  const deviceRows = Object.entries(deviceCategories)
    .filter(([, data]) => data.spend > 0 || data.purchases > 0)
    .map(([device, data]) => {
      const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00';
      const costPerPurchase = data.purchases > 0 ? Math.round(data.spend / data.purchases) : 0;
      
      return {
        device: device.charAt(0).toUpperCase() + device.slice(1).replace('_', ' '),
        spend: Math.round(data.spend),
        purchases: data.purchases,
        ctr: parseFloat(ctr),
        costPerPurchase: costPerPurchase
      };
    });

  if (deviceRows.length === 0) return null;

  // Calculate totals and averages
  const totalSpend = Math.round(deviceRows.reduce((sum, row) => sum + row.spend, 0));
  const totalPurchases = deviceRows.reduce((sum, row) => sum + row.purchases, 0);
  const totalClicks = Object.values(deviceCategories).reduce((sum, data) => sum + data.clicks, 0);
  const totalImpressions = Object.values(deviceCategories).reduce((sum, data) => sum + data.impressions, 0);
  const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const averageCostPerPurchase = totalPurchases > 0 ? Math.round(totalSpend / totalPurchases) : 0;

  return (
    <div className="w-1/2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 chart-container chart-card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm">📱</span>
            </div>
            Device Breakdown
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Performance metrics across different device platforms</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Device Platform</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Spend (₹)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Purchases</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">CTR (%)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Cost per Purchase (₹)</th>
              </tr>
            </thead>
            <tbody>
              {deviceRows.map((row, index) => (
                <tr 
                  key={row.device} 
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        row.device === 'Desktop' ? 'bg-blue-500' :
                        row.device === 'Mobile app' ? 'bg-green-500' :
                        row.device === 'Mobile web' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{row.device}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{row.spend.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {row.purchases.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {row.ctr}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{row.costPerPurchase.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                <td className="py-4 px-4">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{totalSpend.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totalPurchases.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {averageCtr}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{averageCostPerPurchase.toLocaleString()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};