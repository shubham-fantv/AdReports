"use client";
import { parseSpend } from "../../utils/currencyHelpers";

export default function AdsAggregateCards({ adsData, selectedAccount }) {
  if (!adsData || adsData.length === 0) return null;

  // Helper function to get action value
  const getActionValue = (actions, actionType) => {
    if (!actions || !Array.isArray(actions)) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || 0) : 0;
  };

  // Separate ads by type (Video vs Image)
  const videoAds = adsData.filter(ad => 
    ad.assetType === 'Video Ad' || ad.assetType === 'DPA Video'
  );
  
  const imageAds = adsData.filter(ad => 
    ad.assetType === 'Image Ad' || ad.assetType === 'DPA Image' || ad.assetType === 'DPA'
  );

  // Calculate video metrics
  const videoMetrics = {
    totalAds: videoAds.length,
    normalAds: videoAds.filter(ad => ad.assetType === 'Video Ad').length,
    dpaAds: videoAds.filter(ad => ad.assetType === 'DPA Video').length,
    totalSpend: videoAds.reduce((sum, ad) => sum + parseFloat(ad.spend || 0), 0),
    totalPurchases: videoAds.reduce((sum, ad) => sum + ad.purchases, 0),
    totalImpressions: videoAds.reduce((sum, ad) => sum + parseInt(ad.impressions || 0), 0),
    totalClicks: videoAds.reduce((sum, ad) => sum + parseInt(ad.clicks || 0), 0)
  };

  // Calculate image metrics
  const imageMetrics = {
    totalAds: imageAds.length,
    normalAds: imageAds.filter(ad => ad.assetType === 'Image Ad').length,
    dpaAds: imageAds.filter(ad => ad.assetType === 'DPA Image' || ad.assetType === 'DPA').length,
    totalSpend: imageAds.reduce((sum, ad) => sum + parseFloat(ad.spend || 0), 0),
    totalPurchases: imageAds.reduce((sum, ad) => sum + ad.purchases, 0),
    totalImpressions: imageAds.reduce((sum, ad) => sum + parseInt(ad.impressions || 0), 0),
    totalClicks: imageAds.reduce((sum, ad) => sum + parseInt(ad.clicks || 0), 0)
  };

  // Calculate derived metrics
  const calculateDerivedMetrics = (metrics) => ({
    ...metrics,
    avgCtr: metrics.totalImpressions > 0 ? ((metrics.totalClicks / metrics.totalImpressions) * 100).toFixed(2) : '0.00',
    avgCpc: metrics.totalClicks > 0 ? (metrics.totalSpend / metrics.totalClicks).toFixed(2) : '0.00',
    costPerPurchase: metrics.totalPurchases > 0 ? (metrics.totalSpend / metrics.totalPurchases).toFixed(2) : '0.00'
  });

  const videoStats = calculateDerivedMetrics(videoMetrics);
  const imageStats = calculateDerivedMetrics(imageMetrics);

  const MetricCard = ({ title, icon, gradient, stats, bgColor, isSingle = false }) => (
    <div className={`${bgColor} rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mr-4`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalAds} advertisements
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${isSingle ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {/* Total Spend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Spend</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">💳</span>
          </div>
          <p className={`${isSingle ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white`}>
            ₹{Math.round(stats.totalSpend).toLocaleString()}
          </p>
        </div>
        
        {/* Purchases */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Purchases</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">🛒</span>
          </div>
          <p className={`${isSingle ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white`}>
            {stats.totalPurchases.toLocaleString()}
          </p>
        </div>

        {/* CTR */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">CTR</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">📈</span>
          </div>
          <p className={`${isSingle ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white`}>
            {stats.avgCtr}%
          </p>
        </div>
        
        {/* CPA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">CPA</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">🎯</span>
          </div>
          <p className={`${isSingle ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white`}>
            ₹{Math.round(parseFloat(stats.costPerPurchase)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      {!isSingle && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Total Ads: {stats.totalAds}</span>
            <span>Avg CPC: ₹{stats.avgCpc}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ad Performance Overview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Aggregated metrics for video and image advertisements for {selectedAccount === "default" ? "VideoNation" : selectedAccount === "videonation_af" ? "VideoNation_AF" : selectedAccount === "photonation_af" ? "PhotoNation_AF" : selectedAccount === "mms_af" ? "MMS_AF" : selectedAccount === "lf_af" ? "LF_AF" : "MMS"}
        </p>
      </div>
      
      <div className={`grid gap-6 ${
        (videoAds.length > 0 && imageAds.length > 0) 
          ? 'grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1'
      }`}>
        {/* Video Ads Card */}
        {videoAds.length > 0 && (
          <MetricCard
            title="Video Advertisements"
            icon="🎬"
            gradient="from-purple-500 to-purple-600"
            stats={videoStats}
            bgColor="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
            isSingle={imageAds.length === 0}
          />
        )}

        {/* Image Ads Card */}
        {imageAds.length > 0 && (
          <MetricCard
            title="Image Advertisements"
            icon="🖼️"
            gradient="from-blue-500 to-cyan-600"
            stats={imageStats}
            bgColor="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
            isSingle={videoAds.length === 0}
          />
        )}
      </div>

      {/* No data state */}
      {videoAds.length === 0 && imageAds.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Ad Data</h3>
          <p className="text-gray-600 dark:text-gray-400">No advertisement data available for the selected date range and account.</p>
        </div>
      )}
    </div>
  );
}