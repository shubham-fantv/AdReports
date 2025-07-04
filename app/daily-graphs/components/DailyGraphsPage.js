"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { format, subDays } from 'date-fns';
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
  DeviceBreakdownTable,
  PlacementBreakdownChart
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
  getActionRevenue,
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
  const [activeRange, setActiveRange] = useState("L7");
  const [analysis, setAnalysis] = useState("");
  const [analyzingData, setAnalyzingData] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("default");
  const [selectedLevel, setSelectedLevel] = useState("account");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedGraphLevel, setSelectedGraphLevel] = useState("normal");

  // Initialize default date range to L7 (last 7 days)
  useEffect(() => {
    // Set L7 (last 7 days) as default using IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    
    const endDate = format(istNow, 'yyyy-MM-dd');
    const startDate = format(subDays(istNow, 7), 'yyyy-MM-dd');
    
    setDailyStartDate(startDate);
    setDailyEndDate(endDate);
    setActiveRange("L7");
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

  // Fetch data when dates are set or when account/level/country/graphLevel changes
  useEffect(() => {
    if (dailyStartDate && dailyEndDate && isAuthenticated) {
      handleFetchDailyData();
    }
  }, [dailyStartDate, dailyEndDate, selectedAccount, selectedLevel, selectedCountry, selectedGraphLevel, isAuthenticated]);

  // Console log MMS purchase data when chartData updates
  useEffect(() => {
    if (selectedAccount === "mms" && selectedLevel === "account" && chartData.length > 0) {
      const totalPurchasesOldMethod = chartData.reduce((sum, item) => {
        const actions = item.actions || [];
        const purchaseAction = actions.find(a => a.action_type === 'purchase');
        return sum + (purchaseAction ? parseInt(purchaseAction.value || 0) : 0);
      }, 0);
      
      const totalPurchasesCorrectMethod = chartData.reduce((sum, item) => {
        return sum + getActionValue(item.actions, 'purchase');
      }, 0);
      
      console.log('🎵 MMS Account Level Data Loaded:');
      console.log('📊 Total Purchases (Old Method):', totalPurchasesOldMethod);
      console.log('📊 Total Purchases (Correct Method with getActionValue):', totalPurchasesCorrectMethod);
      console.log('📅 Date Range:', dailyStartDate, 'to', dailyEndDate);
      console.log('📈 Daily Purchase Breakdown:', chartData.map(item => ({
        date: item.date_start || item.date,
        purchasesOldMethod: item.actions?.find(a => a.action_type === 'purchase')?.value || 0,
        purchasesCorrectMethod: getActionValue(item.actions, 'purchase'),
        spend: parseFloat(item.spend || 0),
        clicks: parseInt(item.clicks || 0),
        actions: item.actions,
        // Check for revenue data in different possible locations
        action_values: item.action_values,
        purchase_value: item.purchase_value,
        revenue: item.revenue,
        sales: item.sales
      })));
      
      // Check if there's actual revenue data in actions
      console.log('💰 Revenue Analysis:', chartData.map(item => {
        const purchaseAction = item.actions?.find(a => a.action_type === 'purchase');
        return {
          date: item.date_start || item.date,
          purchaseAction: purchaseAction,
          actionValue: purchaseAction?.action_value,
          value: purchaseAction?.value,
          allActionTypes: item.actions?.map(a => ({ type: a.action_type, value: a.value, action_value: a.action_value }))
        };
      }));
      console.log('💰 Raw Chart Data:', chartData);
    }
  }, [chartData, selectedAccount, selectedLevel, dailyStartDate, dailyEndDate]);

  const handleFetchDailyData = () => {
    fetchDailyData(
      dailyStartDate,
      dailyEndDate,
      selectedAccount,
      selectedLevel,
      selectedCountry,
      selectedGraphLevel,
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

  const handleQuickDateRange = (days, rangeKey) => {
    // Get current date in IST
    const now = new Date();
    // Convert to IST by adding 5.5 hours (IST is UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    
    let endDate, startDate;
    
    if (days === 0) {
      // L0 means today only
      endDate = format(istNow, 'yyyy-MM-dd');
      startDate = format(istNow, 'yyyy-MM-dd');
    } else {
      // Calculate start date by subtracting days
      endDate = format(istNow, 'yyyy-MM-dd');
      startDate = format(subDays(istNow, days), 'yyyy-MM-dd');
    }
    
    // Set the dates and active range
    setDailyStartDate(startDate);
    setDailyEndDate(endDate);
    setActiveRange(rangeKey);
    
    // Clear existing data
    setChartData([]);
    
    // Fetch data immediately with the new date range
    fetchDailyData(
      startDate,
      endDate,
      selectedAccount,
      selectedLevel,
      selectedCountry,
      selectedGraphLevel,
      setChartData,
      setAgeData,
      setGenderData,
      setDeviceData,
      setLoading
    );
  };

  // Create wrapped functions that include necessary dependencies
  const wrappedCalculateSummaryMetrics = () => calculateSummaryMetrics(chartData, getActionValue);
  const wrappedCalculateMmsMetrics = () => {
    console.log('🔧 MMS Metrics Calculation - Chart Data:', chartData);
    console.log('🔧 MMS Metrics Calculation - Chart Data Length:', chartData.length);
    const result = calculateMmsMetrics(chartData, getActionValue);
    console.log('🔧 MMS Metrics Result:', result);
    return result;
  };
  const wrappedGenerateAgeSpendPieChartData = () => generateAgeSpendPieChartData(ageData);
  const wrappedGenerateAgePurchasePieChartData = () => generateAgePurchasePieChartData(ageData, getActionValue);
  const wrappedGenerateGenderPurchasePieChartData = () => generateGenderPurchasePieChartData(genderData, getActionValue);
  const wrappedGenerateGenderSpendPieChartData = () => generateGenderSpendPieChartData(genderData);
  const wrappedGenerateSpendVsPurchaseChartData = () => generateSpendVsPurchaseChartData(chartData, getActionValue);
  const wrappedGenerateSpendVsPurchaseScatterData = () => generateSpendVsPurchaseScatterData(chartData, getActionValue);
  const wrappedGenerateClicksVsCtrChartData = () => generateClicksVsCtrChartData(chartData);

  // AI Insights generation function
  const generateAIInsights = (data, account) => {
    if (!data || data.length === 0) return "No campaign data available for analysis. Launch some campaigns to get AI-powered insights for your platform! 🚀";
    
    // Platform context for better insights
    const platformContext = account === "mms" 
      ? "MMS (AI music generation mobile app with credit pack purchasing model)"
      : "VideoNation (AI video/image generation web platform with subscription model)";
    
    const totalSpend = data.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
    const totalImpressions = data.reduce((sum, item) => sum + parseFloat(item.impressions || 0), 0);
    const totalClicks = data.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
    const avgCTR = data.reduce((sum, item) => sum + parseFloat(item.ctr || 0), 0) / data.length;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    
    let totalPurchases = 0;
    if (account === "mms") {
      totalPurchases = data.reduce((sum, item) => {
        return sum + getActionValue(item.actions, 'purchase');
      }, 0);
      console.log('🤖 AI Insights - MMS Account Level - Total Purchases (Correct Method):', totalPurchases);
      console.log('🤖 AI Insights - MMS Purchase data breakdown:', data.map(item => ({
        date: item.date_start || item.date,
        purchases: getActionValue(item.actions, 'purchase'),
        actions: item.actions
      })));
    } else {
      totalPurchases = data.reduce((sum, item) => {
        return sum + getActionValue(item.actions, 'purchase');
      }, 0);
    }
    
    const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
    const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;
    const efficiency = totalPurchases > 0 ? (totalPurchases / totalSpend) * 1000 : 0;
    const impressionToClickRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const burnRate = totalSpend / data.length; // Daily burn rate
    
    // Advanced GenAI startup metrics
    const viralCoefficient = conversionRate > 2 ? "High" : conversionRate > 1 ? "Medium" : "Low";
    const productMarketFit = conversionRate > 2 && avgCTR > 2 ? "Strong signals" : conversionRate > 1 ? "Emerging signals" : "Weak signals";
    const scalabilityIndex = efficiency > 5 ? "Hypergrowth ready" : efficiency > 2 ? "Scale-ready" : "Optimize first";
    
    // Determine performance insights with GenAI context
    let performanceGrade = "🔶 Pre-Product Market Fit";
    let priorityActions = [];
    let strategicInsights = "";
    let aiPersonality = "";
    
    // Performance observations based on data patterns with platform context
    const businessModel = account === "mms" ? "credit pack purchases" : "subscription conversions";
    const platformType = account === "mms" ? "AI music generation mobile app" : "AI video/image creation web platform";
    const distributionChannel = account === "mms" ? "mobile app" : "web platform";
    
    if (avgCTR > 3.0 && conversionRate > 3.0 && costPerPurchase < 200) {
      performanceGrade = "🚀 High Performance Pattern";
      strategicInsights = `Current metrics show strong engagement (CTR: ${avgCTR.toFixed(2)}%) and conversion efficiency for ${platformContext}. This pattern typically indicates good product-market alignment for ${platformType} services.`;
    } else if (avgCTR > 2.0 && conversionRate > 2.0 && costPerPurchase < 400) {
      performanceGrade = "🦄 Promising Metrics";
      strategicInsights = `Data shows above-average performance across key metrics for ${platformType}. CTR and ${businessModel} rates suggest the campaign messaging resonates with users who prefer ${distributionChannel}-based AI content creation tools.`;
    } else if (avgCTR > 1.5 && conversionRate > 1.0) {
      performanceGrade = "⚡ Positive Trend";
      strategicInsights = `Metrics indicate early positive signals for ${platformContext}. CTR suggests audience interest in ${platformType}, while conversion rate shows some appeal for the ${businessModel} model.`;
    } else if (avgCTR > 1.0 || totalPurchases > 0) {
      performanceGrade = "🎯 Initial Traction";
      strategicInsights = `Data shows some engagement and ${businessModel} activity for ${platformType}. Performance suggests potential but may benefit from optimization targeting users interested in AI content creation.`;
    } else {
      performanceGrade = "🔬 Early Data";
      strategicInsights = `Current metrics show limited conversion activity for ${platformContext}. This is common in early campaign phases for AI platforms and provides baseline data for optimization.`;
    }
    
    // Observational insights based on data patterns with platform context
    if (conversionRate < 0.5) {
      priorityActions.push(`🆘 **Low Conversion Observed**: ${conversionRate.toFixed(2)}% conversion rate for ${businessModel} is below typical benchmarks for AI platforms. This pattern often suggests opportunities to review user journey and ${distributionChannel} experience for ${platformType} users.`);
    } else if (conversionRate < 1.0) {
      priorityActions.push(`🎯 **Conversion Opportunity**: ${conversionRate.toFixed(2)}% conversion rate for ${businessModel} indicates potential for improvement. User behavior analysis tools could provide insights into how users interact with ${platformType} offerings.`);
    }
    
    if (costPerPurchase > 1000) {
      priorityActions.push(`💸 **High Acquisition Cost**: ₹${Math.round(costPerPurchase).toLocaleString()} cost per ${businessModel.slice(0, -1)} is above industry averages for AI content platforms. Consider analyzing lifetime value metrics specific to ${platformType} users.`);
    } else if (costPerPurchase > 500) {
      priorityActions.push(`📊 **Cost Efficiency Review**: ₹${Math.round(costPerPurchase).toLocaleString()} cost per ${businessModel.slice(0, -1)} suggests reviewing targeting and campaign optimization for ${platformType} audience segments.`);
    }
    
    if (avgCTR < 0.8) {
      priorityActions.push(`🎨 **Engagement Pattern**: ${avgCTR.toFixed(2)}% CTR is below typical benchmarks for AI content platforms. Testing different creative approaches showcasing ${platformType} capabilities or ${distributionChannel}-optimized ad formats might improve engagement.`);
    } else if (avgCTR > 3.0 && conversionRate < 2.0) {
      priorityActions.push(`🔄 **Interest vs Conversion Gap**: High CTR (${avgCTR.toFixed(2)}%) with lower conversion suggests strong initial interest in ${platformType} but potential optimization opportunities in the ${businessModel} conversion process.`);
    }
    
    if (efficiency > 0 && efficiency < 1) {
      priorityActions.push(`⚠️ **Spend Efficiency**: Current spending of ₹${Math.round(burnRate).toLocaleString()}/day with limited ${businessModel} indicates potential for campaign optimization or strategy review for ${platformContext}.`);
    }
    
    // Data-based observations and patterns with platform context
    let recommendations = "";
    let tacticalNext = "";
    
    if (totalPurchases < 3) {
      recommendations = `With limited ${businessModel} data (${totalPurchases} conversions), qualitative insights may be more valuable than statistical analysis for ${platformType} at this stage.`;
      tacticalNext = `Consider testing different ${distributionChannel} experience approaches highlighting ${platformType} value propositions or gathering user feedback to understand conversion barriers specific to ${distributionChannel}-based AI content creation.`;
    } else if (efficiency > 5) {
      recommendations = `Current efficiency metrics (${efficiency.toFixed(1)} ${businessModel} per ₹1000 spent) suggest strong campaign performance for ${platformContext}.`;
      tacticalNext = `Data indicates potential for expanding to additional marketing channels optimized for ${distributionChannel} users while maintaining current performance levels for ${platformType} targeting.`;
    } else if (efficiency > 2) {
      recommendations = `Moderate efficiency levels (${efficiency.toFixed(1)} ${businessModel} per ₹1000) indicate room for optimization while maintaining current approaches for ${platformType}.`;
      tacticalNext = `Consider implementing detailed analytics to identify highest-performing audience segments interested in ${platformType} and ${distributionChannel}-optimized creative variations showcasing AI capabilities.`;
    } else {
      recommendations = `Current performance metrics for ${platformContext} suggest opportunities for campaign optimization across multiple areas.`;
      tacticalNext = `Consider systematic testing of campaign elements: targeting users interested in ${platformType}, ${distributionChannel}-optimized creative showcasing AI capabilities, and ${businessModel} conversion funnel components.`;
    }
    
    return `**📊 Campaign Performance Analysis**

${performanceGrade}

**Key Metrics Observed:**
• Cost per Purchase: ₹${Math.round(costPerPurchase).toLocaleString()} | Conversion Rate: ${conversionRate.toFixed(2)}% | Daily Spend: ₹${Math.round(burnRate).toLocaleString()}

**Data Insights:**
${strategicInsights}

${priorityActions.length > 0 ? '**Patterns Identified:**\n' + priorityActions.slice(0, 2).join('\n') : '🎉 **Current Status**: Metrics show stable performance across key indicators.'}

**Suggested Next Steps:** ${tacticalNext}`;
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/20 dark:border-[#2a2a2a] shadow-lg shadow-purple-500/10 dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg text-white">📈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">Comprehensive performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20 dark:shadow-blue-500/20"
              >
                <span>← Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Filters and Controls */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-4 mb-6">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <option value="account">Account</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>

            {/* Country Selection - Only show for MMS account level */}
            {selectedAccount === "mms" && selectedLevel !== "campaign" && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setChartData([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                >
                  <option value="all">All Countries</option>
                  <option value="india">India</option>
                  <option value="us">US</option>
                </select>
              </div>
            )}

            {/* Graph Level Selection - Only show for MMS campaign level */}
            {selectedAccount === "mms" && selectedLevel === "campaign" && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Graph Level
                </label>
                <select
                  value={selectedGraphLevel}
                  onChange={(e) => {
                    setSelectedGraphLevel(e.target.value);
                    setChartData([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="us_aggregate">US Aggregate</option>
                  <option value="india_aggregate">India Aggregate</option>
                </select>
              </div>
            )}


            {/* Date Range Quick Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "L0", days: 0, key: "L0" },
                { label: "L1", days: 1, key: "L1" },
                { label: "L7", days: 7, key: "L7" },
                { label: "L10", days: 10, key: "L10" },
                { label: "L30", days: 30, key: "L30" },
              ].map(range => (
                <button
                  key={range.key}
                  onClick={() => handleQuickDateRange(range.days, range.key)}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex-shrink-0 flex flex-col">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Apply
                </label>
                <button
                  onClick={() => {
                    handleFetchDailyData();
                    setActiveRange("custom");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                <button
                  onClick={() => {
                    if (chartData.length > 0) {
                      setAnalyzingData(true);
                      // Simulate AI analysis
                      setTimeout(() => {
                        const insights = generateAIInsights(chartData, selectedAccount);
                        setAnalysis(insights);
                        setAnalyzingData(false);
                      }, 2000);
                    }
                  }}
                  disabled={chartData.length === 0 || analyzingData}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {analyzingData ? "Analyzing..." : "Analyze Data"}
                </button>
              </div>
              {analyzingData ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing campaign performance...</span>
                </div>
              ) : analysis ? (
                <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                  {analysis.split('\n').map((line, index) => {
                    // Handle headers
                    if (line.startsWith('**') && line.endsWith('**')) {
                      const text = line.replace(/\*\*/g, '');
                      return (
                        <div key={index} className="font-bold text-base text-gray-900 dark:text-white mb-3 mt-4 first:mt-0">
                          {text}
                        </div>
                      );
                    }
                    // Handle performance grade with emojis
                    if (line.includes('🚀') || line.includes('✅') || line.includes('⚡') || line.includes('🔶')) {
                      return (
                        <div key={index} className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                          {line}
                        </div>
                      );
                    }
                    // Handle bullet points
                    if (line.startsWith('• ')) {
                      const bulletText = line.substring(2);
                      // Parse bold text for bullet points
                      const parseTextWithBold = (text) => {
                        const parts = text.split(/(\*\*[^*]+\*\*)/);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.replace(/\*\*/g, '')}</strong>;
                          }
                          return part;
                        });
                      };
                      
                      return (
                        <div key={index} className="ml-4 mb-2 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700 dark:text-gray-200">
                            {bulletText.includes('**') ? parseTextWithBold(bulletText) : bulletText}
                          </span>
                        </div>
                      );
                    }
                    // Handle priority action items with emojis
                    if (line.includes('🎯') || line.includes('💸') || line.includes('📱') || line.includes('🔄') || line.includes('🆘') || line.includes('🎨') || line.includes('⚠️')) {
                      const priority = line.includes('Critical') || line.includes('Code Red') ? 'red' : 
                                     line.includes('High Priority') || line.includes('Crisis') ? 'orange' : 'yellow';
                      const bgColor = priority === 'red' ? 'bg-red-50 dark:bg-red-900/30 border-red-500' : 
                                     priority === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500' : 
                                     'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500';
                      const textColor = priority === 'red' ? 'text-red-800 dark:text-red-200' : 
                                       priority === 'orange' ? 'text-orange-800 dark:text-orange-200' : 
                                       'text-yellow-800 dark:text-yellow-200';
                      
                      // Parse bold text within the line
                      const parseTextWithBold = (text) => {
                        const parts = text.split(/(\*\*[^*]+\*\*)/);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold">{part.replace(/\*\*/g, '')}</strong>;
                          }
                          return part;
                        });
                      };
                      
                      return (
                        <div key={index} className={`p-3 mb-3 rounded-lg border-l-4 ${bgColor}`}>
                          <div className={`font-medium ${textColor}`}>
                            {parseTextWithBold(line)}
                          </div>
                        </div>
                      );
                    }
                    // Handle celebration message
                    if (line.includes('🎉')) {
                      return (
                        <div key={index} className="p-3 mb-3 rounded-lg border-l-4 bg-green-50 dark:bg-green-900/30 border-green-500">
                          <div className="font-medium text-green-800 dark:text-green-200">{line}</div>
                        </div>
                      );
                    }
                    // Regular text
                    if (line.trim()) {
                      // Parse bold text for any line that contains **
                      const parseTextWithBold = (text) => {
                        const parts = text.split(/(\*\*[^*]+\*\*)/);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.replace(/\*\*/g, '')}</strong>;
                          }
                          return part;
                        });
                      };
                      
                      return (
                        <div key={index} className="mb-2 text-gray-700 dark:text-gray-200">
                          {line.includes('**') ? parseTextWithBold(line) : line}
                        </div>
                      );
                    }
                    // Empty line for spacing
                    return <div key={index} className="mb-2"></div>;
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click "Analyze Data" to get AI-powered insights about your campaign performance.
                </p>
              )}
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

        {/* MMS Cards - Show for MMS account at both account and campaign level */}
        {selectedAccount === "mms" && chartData.length > 0 && (
          <MmsPerformanceCards 
            key={`mms-cards-${selectedLevel === "campaign" ? selectedGraphLevel : selectedCountry}-${chartData.length}`}
            chartData={chartData} 
            calculateMmsMetrics={wrappedCalculateMmsMetrics}
            selectedCountry={selectedCountry}
            selectedGraphLevel={selectedGraphLevel}
            selectedLevel={selectedLevel}
          />
        )}


        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-[#2a2a2a]">
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

        {/* Audience Breakdown - Only show for MMS account and account level, skip if country filter is applied */}
        {selectedAccount === "mms" && selectedLevel === "account" && selectedCountry === "all" && (ageData.length > 0 || genderData.length > 0) && (
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

        {/* VideoNation Cards - Show for VideoNation campaign level only (account level cards are already shown at top) */}
        {selectedAccount === "default" && selectedLevel === "campaign" && chartData.length > 0 && (
          <VideoNationPerformanceCards 
            chartData={chartData} 
            calculateSummaryMetrics={wrappedCalculateSummaryMetrics}
          />
        )}


        {/* Campaign Level Charts */}
        {selectedLevel === "campaign" && chartData.length > 0 && (
          <div className="space-y-6">

            {/* Show Individual Metrics Grid for Aggregates, Individual Campaign Charts for Normal */}
            {(selectedAccount === "mms" && (selectedGraphLevel === "us_aggregate" || selectedGraphLevel === "india_aggregate")) ? (
              // Show account-level style charts for aggregates
              <IndividualMetricsGrid 
                chartData={chartData} 
                generateIndividualMetricChart={generateIndividualMetricChart}
                getActionValue={getActionValue}
                getChartOptions={getChartOptions}
                theme={theme}
                accountType={selectedAccount}
              />
            ) : (
              // Show individual campaign charts for normal level
              <>
                {getUniqueCampaigns(chartData, selectedLevel)
                  .filter(campaign => {
                    // Filter out campaigns with zero spend across entire date range
                    const totalSpend = campaign.data.reduce((sum, item) => sum + (parseFloat(item.spend) || 0), 0);
                    if (totalSpend === 0) return false;
                    
                    // Filter out campaigns where all individual dates have spend < ₹10
                    const hasValidSpendDates = campaign.data.some(item => (parseFloat(item.spend) || 0) >= 10);
                    return hasValidSpendDates;
                  })
                  .map(campaign => {
                    // Filter the campaign data to only include dates with spend >= ₹10
                    const filteredData = campaign.data.filter(item => (parseFloat(item.spend) || 0) >= 10);
                    return {
                      ...campaign,
                      data: filteredData
                    };
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
                if (totalSpend === 0) return false;
                
                // Filter out campaigns where all individual dates have spend < ₹10
                const hasValidSpendDates = campaign.data.some(item => (parseFloat(item.spend) || 0) >= 10);
                return hasValidSpendDates;
              }).length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Campaigns</h3>
                <p className="text-gray-600 dark:text-gray-400">No campaigns with spend ≥ ₹10 found for the selected date range</p>
              </div>
            )}
              </>
            )}
            
            {/* Placement Breakdown Chart - Show for MMS campaign level (all countries) and VideoNation campaign level */}
            {((selectedAccount === "mms" && selectedLevel === "campaign" && selectedCountry === "all") || 
              (selectedAccount === "default" && selectedLevel === "campaign")) && 
              deviceData.length > 0 && (
              <PlacementBreakdownChart 
                placementData={deviceData} 
                theme={theme}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}