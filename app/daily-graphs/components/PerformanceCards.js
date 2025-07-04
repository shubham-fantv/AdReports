"use client";

// Performance cards components

export const MmsPerformanceCards = ({ chartData, calculateMmsMetrics, selectedCountry = "all", selectedGraphLevel = "normal", selectedLevel = "account" }) => {
  if (!chartData.length) return null;

  // Force re-render by creating a dependency on chartData timestamp
  const lastDataUpdate = new Date().toISOString();

  // Get action value function (locally defined to avoid import issues)
  const getActionValue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || 0) : 0;
  };

  const getActionRevenue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseFloat(action.action_value || 0) : 0;
  };

  // Use aggregate data if available (more accurate), otherwise fall back to chart data
  const dataForCalculation = window.aggregateDataForCards && window.aggregateDataForCards.length > 0 
    ? window.aggregateDataForCards 
    : chartData;
    
  console.log('🎯 MMS Cards - Data source:', window.aggregateDataForCards ? 'Aggregate Data' : 'Chart Data');
  console.log('🎯 MMS Cards - Level:', selectedLevel);
  console.log('🎯 MMS Cards - Country filter from props:', selectedCountry);
  console.log('🎯 MMS Cards - Graph level from props:', selectedGraphLevel);
  console.log('🎯 MMS Cards - Current country filter in window:', window.currentCountryFilter);
  console.log('🎯 MMS Cards - Current graph level in window:', window.currentGraphLevel);
  console.log('🎯 MMS Cards - Data being used:', dataForCalculation);
  console.log('🎯 MMS Cards - Timestamp:', new Date().toISOString());

  // Calculate basic metrics directly from the chosen data source
  const totalSpend = dataForCalculation.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
  const totalPurchases = dataForCalculation.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
  const totalImpressions = dataForCalculation.reduce((sum, item) => sum + parseFloat(item.impressions || 0), 0);
  const totalClicks = dataForCalculation.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
  
  // Manual Revenue Calculation for MMS Credit Packs
  // MMS sells AI music generation credits in packs:
  // - India market: ₹499 per credit pack
  // - US market: ₹1700 per credit pack 
  let indiaPurchases, usPurchases, totalRevenue;
  
  if (selectedLevel === "campaign" && selectedGraphLevel === "india_aggregate") {
    // For India aggregate, all purchases are India purchases
    indiaPurchases = totalPurchases;
    usPurchases = 0;
    totalRevenue = indiaPurchases * 499;
  } else if (selectedLevel === "campaign" && selectedGraphLevel === "us_aggregate") {
    // For US aggregate, all purchases are US purchases
    indiaPurchases = 0;
    usPurchases = totalPurchases;
    totalRevenue = usPurchases * 1700;
  } else {
    // For normal level, assume 80% India, 20% US based on typical distribution
    indiaPurchases = Math.round(totalPurchases * 0.8);
    usPurchases = totalPurchases - indiaPurchases;
    totalRevenue = (indiaPurchases * 499) + (usPurchases * 1700);
  }
  
  // Manual ROAS Calculation
  // ROAS = Revenue / Ad Spend
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  
  // Other manual calculations
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;
  
  // Compare with chart data if using aggregate data
  if (window.aggregateDataForCards && window.aggregateDataForCards.length > 0) {
    const chartDataPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
    console.log('📊 COMPARISON - Chart Data vs Aggregate Data:');
    console.log('- Chart Data Purchases:', chartDataPurchases);
    console.log('- Aggregate Data Purchases:', totalPurchases);
    console.log('- Difference:', totalPurchases - chartDataPurchases);
  }

  // Debug logging with manual calculations
  console.log('🎯 MMS Cards - Manual Calculations:');
  console.log('- Data Source:', window.aggregateDataForCards ? 'API Aggregate (per_day: false)' : 'Chart Data (per_day: true)');
  console.log('- Level:', selectedLevel);
  console.log('- Country Filter:', selectedLevel !== "campaign" ? selectedCountry : 'N/A');
  console.log('- Graph Level:', selectedLevel === "campaign" ? selectedGraphLevel : 'N/A');
  console.log('- Total Spend:', totalSpend.toLocaleString());
  console.log('- Total Credit Packs Sold:', totalPurchases);
  if (selectedLevel === "campaign" && selectedGraphLevel === "india_aggregate") {
    console.log('- India Purchases (100%):', indiaPurchases, '× ₹499 =', (indiaPurchases * 499).toLocaleString());
    console.log('- US Purchases (0%):', usPurchases);
  } else if (selectedLevel === "campaign" && selectedGraphLevel === "us_aggregate") {
    console.log('- India Purchases (0%):', indiaPurchases);
    console.log('- US Purchases (100%):', usPurchases, '× ₹1700 =', (usPurchases * 1700).toLocaleString());
  } else {
    console.log('- India Purchases (80%):', indiaPurchases, '× ₹499 =', (indiaPurchases * 499).toLocaleString());
    console.log('- US Purchases (20%):', usPurchases, '× ₹1700 =', (usPurchases * 1700).toLocaleString());
  }
  console.log('- Total Revenue:', totalRevenue.toLocaleString());
  console.log('- ROAS:', roas.toFixed(2) + 'x');
  console.log('- Cost per Credit Pack:', costPerPurchase.toFixed(2));
  console.log('- Conversion Rate:', conversionRate.toFixed(2) + '%');
  console.log('- CPM:', avgCpm.toFixed(2));
  console.log('- CPC:', avgCpc.toFixed(2));
  
  // Determine the title based on the current context
  const getCardTitle = () => {
    if (selectedLevel === "campaign" && selectedGraphLevel === "india_aggregate") {
      return "MMS Performance Overview - India Aggregate";
    } else if (selectedLevel === "campaign" && selectedGraphLevel === "us_aggregate") {
      return "MMS Performance Overview - US Aggregate";
    } else {
      return "MMS Performance Overview";
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{getCardTitle()}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Ad Spends vs Revenue */}
        <div className="bg-gradient-to-br from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 rounded-3xl p-5 shadow-sm border border-red-100 dark:border-red-800/30">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 text-center uppercase tracking-wide">
            Ad Spends vs Revenue
          </h3>
          <div className="space-y-4">
            {/* Ad Spend Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Ad Spend
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">💳</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{Math.round(totalSpend).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Total advertising spend
              </div>
            </div>

            {/* Sales Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Sales Revenue
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">💰</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{Math.round(totalRevenue).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                {selectedLevel === "campaign" && selectedGraphLevel === "india_aggregate" 
                  ? `${indiaPurchases} India purchases (₹499 each)` 
                  : selectedLevel === "campaign" && selectedGraphLevel === "us_aggregate"
                  ? `${usPurchases} US purchases (₹1700 each)`
                  : `${indiaPurchases} India (₹499) + ${usPurchases} US (₹1700)`}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: ROAS vs Cost Per Purchase */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-5 shadow-sm border border-blue-100 dark:border-blue-800/30">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 text-center uppercase tracking-wide">
            ROAS vs Cost Per Purchase
          </h3>
          <div className="space-y-4">
            {/* ROAS Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  ROAS
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">📈</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {roas.toFixed(2)}x
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Return on Ad Spend
              </div>
            </div>

            {/* Cost Per Purchase Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Cost Per Purchase
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">🎯</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{Math.round(costPerPurchase).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Average acquisition cost
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: CPM vs CPC */}
        <div className="bg-gradient-to-br from-orange-50 to-teal-50 dark:from-orange-900/20 dark:to-teal-900/20 rounded-3xl p-5 shadow-sm border border-orange-100 dark:border-orange-800/30">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 text-center uppercase tracking-wide">
            CPM vs CPC
          </h3>
          <div className="space-y-4">
            {/* CPM Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  CPM
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">👁️</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{avgCpm.toFixed(2)}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Cost per 1000 impressions
              </div>
            </div>

            {/* CPC Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  CPC
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">👆</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{avgCpc.toFixed(2)}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Cost per click
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Total Purchases */}
        <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-3xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 text-center uppercase tracking-wide">
            Total Purchases
          </h3>
          <div className="space-y-4">
            {/* Total Purchases Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Credit Packs Sold
                </h4>
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm">🎵</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPurchases.toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                Total credit pack purchases
              </div>
            </div>

            {/* Empty space to match other columns height */}
            <div className="h-[140px]"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export const VideoNationPerformanceCards = ({ chartData, calculateSummaryMetrics }) => {
  if (!chartData.length) return null;

  // Get action value function (locally defined to avoid import issues)
  const getActionValue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || 0) : 0;
  };

  // Use aggregate data if available (more accurate), otherwise fall back to chart data
  const dataForCalculation = window.aggregateDataForCards && window.aggregateDataForCards.length > 0 
    ? window.aggregateDataForCards 
    : chartData;
    
  console.log('🎬 VideoNation Cards - Data source:', window.aggregateDataForCards ? 'Aggregate Data' : 'Chart Data');
  console.log('🎬 VideoNation Cards - Data being used:', dataForCalculation);

  // Calculate metrics directly from the chosen data source
  const totalSpend = dataForCalculation.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
  const totalPurchases = dataForCalculation.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
  const totalClicks = dataForCalculation.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  
  // Compare with chart data if using aggregate data
  if (window.aggregateDataForCards && window.aggregateDataForCards.length > 0) {
    const chartDataPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
    const chartDataSpend = chartData.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
    console.log('📊 VideoNation COMPARISON - Chart Data vs Aggregate Data:');
    console.log('- Chart Data Purchases:', chartDataPurchases);
    console.log('- Aggregate Data Purchases:', totalPurchases);
    console.log('- Chart Data Spend:', chartDataSpend.toLocaleString());
    console.log('- Aggregate Data Spend:', totalSpend.toLocaleString());
    console.log('- Purchase Difference:', totalPurchases - chartDataPurchases);
    console.log('- Spend Difference:', totalSpend - chartDataSpend);
  }

  console.log('🎬 VideoNation Cards - Calculations:');
  console.log('- Data Source:', window.aggregateDataForCards ? 'API Aggregate (per_day: false)' : 'Chart Data (per_day: true)');
  console.log('- Total Spend:', totalSpend.toLocaleString());
  console.log('- Total Purchases:', totalPurchases);
  console.log('- Average CPC:', avgCpc.toFixed(2));
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">VideoNation Performance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
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
            Total advertising spend
          </div>
        </div>

        {/* Total Purchases Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Purchases
            </h3>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
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

        {/* Average CPC Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Average CPC
            </h3>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm">👆</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{avgCpc.toFixed(2)}
          </p>
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
            Cost per click
          </div>
        </div>

      </div>
    </div>
  );
};

export const SummaryCards = ({ chartData, calculateSummaryMetrics }) => {
  if (!chartData.length) return null;

  const { totalPurchases } = calculateSummaryMetrics();
  
  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Total Purchases Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group max-w-md mx-auto">
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
    </div>
  );
};