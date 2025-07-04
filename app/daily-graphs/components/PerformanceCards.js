"use client";

// Performance cards components

export const MmsPerformanceCards = ({ chartData, calculateMmsMetrics }) => {
  if (!chartData.length) return null;

  const { totalSpend, totalSales, totalPurchases, roas, costPerPurchase, avgCpm, avgCpc } = calculateMmsMetrics();
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MMS Performance Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
                ₹{Math.round(totalSales).toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                India: ₹499/purchase • US: ₹1700/purchase
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

      </div>
    </div>
  );
};

export const VideoNationPerformanceCards = ({ chartData, calculateSummaryMetrics }) => {
  if (!chartData.length) return null;

  const { totalSpend, totalPurchases } = calculateSummaryMetrics();
  
  // Calculate average CPC
  const totalClicks = chartData.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  
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