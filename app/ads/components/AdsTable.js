"use client";
import { useState } from "react";

export default function AdsTable({ adsData, selectedAccount }) {
  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState({
    ad_id: true,
    dateRange: true,
    description: true,
    link: true,
    creativeName: true,
    daysActive: true
  });

  const toggleColumn = (columnKey) => {
    setHiddenColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const toggleAllColumns = () => {
    const allVisible = Object.values(hiddenColumns).every(hidden => !hidden);
    setHiddenColumns({
      ad_id: allVisible,
      dateRange: allVisible,
      description: allVisible,
      link: allVisible,
      creativeName: allVisible,
      daysActive: allVisible
    });
  };
  if (adsData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">📢</span>
            Ads Data (0 ads)
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ad-level performance data for {selectedAccount === "default" ? "VideoNation" : selectedAccount === "videonation_af" ? "VideoNation_AF" : "MMS"}
          </p>
        </div>
        
        <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📢</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Ads Data</h3>
          <p className="text-gray-600 dark:text-gray-400">No ad-level data found for the selected date range and account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">📢</span>
              Ads Data ({adsData.length} ads)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ad-level performance data for {selectedAccount === "default" ? "VideoNation" : selectedAccount === "videonation_af" ? "VideoNation_AF" : "MMS"}
            </p>
          </div>
          
          {/* Column Visibility Filter */}
          <div className="relative">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap text-xs sm:text-sm">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Show/Hide:</span>
              
              {/* Select All checkbox */}
              <label className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Object.values(hiddenColumns).every(hidden => !hidden)}
                  onChange={toggleAllColumns}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Select All</span>
              </label>
              
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Individual column toggles */}
              <button
                onClick={() => toggleColumn('ad_id')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.ad_id 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.ad_id ? 'Show Ad ID' : 'Hide Ad ID'}
              >
                <span>{hiddenColumns.ad_id ? '👁️‍🗨️' : '👁️'}</span>
                <span>Ad ID</span>
              </button>
              <button
                onClick={() => toggleColumn('creativeName')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.creativeName 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.creativeName ? 'Show Creative Name' : 'Hide Creative Name'}
              >
                <span>{hiddenColumns.creativeName ? '👁️‍🗨️' : '👁️'}</span>
                <span>Creative Name</span>
              </button>
              <button
                onClick={() => toggleColumn('description')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.description 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.description ? 'Show Description' : 'Hide Description'}
              >
                <span>{hiddenColumns.description ? '👁️‍🗨️' : '👁️'}</span>
                <span>Description</span>
              </button>
              <button
                onClick={() => toggleColumn('link')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.link 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.link ? 'Show Link' : 'Hide Link'}
              >
                <span>{hiddenColumns.link ? '👁️‍🗨️' : '👁️'}</span>
                <span>Link</span>
              </button>
              <button
                onClick={() => toggleColumn('dateRange')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.dateRange 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.dateRange ? 'Show Date Range' : 'Hide Date Range'}
              >
                <span>{hiddenColumns.dateRange ? '👁️‍🗨️' : '👁️'}</span>
                <span>Date Range</span>
              </button>
              <button
                onClick={() => toggleColumn('daysActive')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                  hiddenColumns.daysActive 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
                title={hiddenColumns.daysActive ? 'Show Days Active' : 'Hide Days Active'}
              >
                <span>{hiddenColumns.daysActive ? '👁️‍🗨️' : '👁️'}</span>
                <span>Days Active</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
            <tr>
              {!hiddenColumns.ad_id && (
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ad ID
                </th>
              )}
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{width: '256px', minWidth: '256px'}}>
                Ad Name
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Impressions
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Spend
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CTR (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPC (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Purchases
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPA (₹)
              </th>
              {!hiddenColumns.creativeName && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Creative Name
                </th>
              )}
              {!hiddenColumns.description && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
              )}
              {!hiddenColumns.link && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Link
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Asset Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Asset Link
              </th>
              {!hiddenColumns.dateRange && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date Range
                </th>
              )}
              {!hiddenColumns.daysActive && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Days Active
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#1a1a1a] divide-y divide-gray-200 dark:divide-[#2a2a2a]">
            {adsData.map((ad, index) => (
              <tr key={`${ad.ad_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]/50 transition-colors duration-200">
                {!hiddenColumns.ad_id && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                    {ad.ad_id}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white" style={{width: '256px', minWidth: '256px'}}>
                  <div className="truncate" title={ad.ad_name}>
                    <span className="font-medium">{ad.ad_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {Number(ad.impressions || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {Number(ad.clicks || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ₹{Number(ad.spend || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {Number(ad.ctr || 0).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ₹{Number(ad.cpc || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {Number(ad.purchases || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ₹{Number(ad.cpa || 0).toFixed(2)}
                </td>
                {!hiddenColumns.creativeName && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                    <div className="truncate" title={ad.creativeName}>
                      {ad.creativeName || 'N/A'}
                    </div>
                  </td>
                )}
                {!hiddenColumns.description && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                    <div className="truncate" title={ad.creativeDescription}>
                      {ad.creativeDescription || 'N/A'}
                    </div>
                  </td>
                )}
                {!hiddenColumns.link && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-32">
                    <div className="truncate" title={ad.creativeLink}>
                      {ad.creativeLink !== 'N/A' ? (
                        <a 
                          href={ad.creativeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {ad.creativeLink}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ad.assetType === 'DPA Video' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    ad.assetType === 'DPA Image' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    ad.assetType === 'Video Ad' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    ad.assetType === 'Image Ad' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    ad.assetType === 'DPA' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {ad.assetType || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                  <div className="truncate" title={ad.assetLink}>
                    {ad.assetLink !== 'N/A' ? (
                      <a 
                        href={ad.assetLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>{ad.assetType === 'Video Ad' || ad.assetType === 'DPA Video' ? '🎬' : '🖼️'}</span>
                        <span>View Asset</span>
                      </a>
                    ) : 'N/A'}
                  </div>
                </td>
                {!hiddenColumns.dateRange && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {ad.date || 'N/A'}
                  </td>
                )}
                {!hiddenColumns.daysActive && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                      {ad.daysActive || 0} days
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}