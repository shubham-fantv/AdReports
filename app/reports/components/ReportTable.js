"use client";
import React from "react";
import { format, eachDayOfInterval } from 'date-fns';
import { formatCurrency } from "../../utils/currencyHelpers";
import { getActionValue, getPurchaseValue, formatDateString } from "../../utils/dateHelpers";

export default function ReportTable({ data, account, startDate, endDate }) {
  if (!Object.keys(data).length || !startDate || !endDate) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
        <p className="text-gray-600 dark:text-gray-400">No report data available for the selected date range.</p>
      </div>
    );
  }

  // Generate date range for columns
  const dateRange = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  });

  // Function to aggregate campaigns by date
  const aggregateDataByDate = (campaigns) => {
    const aggregated = {};
    
    campaigns.forEach(campaign => {
      const date = campaign.date_start || campaign.date;
      if (!aggregated[date]) {
        aggregated[date] = {
          spend: 0,
          impressions: 0,
          clicks: 0,
          installs: 0,
          purchases: 0
        };
      }
      
      aggregated[date].spend += parseFloat(campaign.spend || 0);
      aggregated[date].impressions += parseInt(campaign.impressions || 0);
      aggregated[date].clicks += parseInt(campaign.clicks || 0);
      aggregated[date].installs += getActionValue(campaign.actions, 'mobile_app_install');
      aggregated[date].purchases += getPurchaseValue(campaign.actions, account);
    });
    
    return aggregated;
  };

  // Calculate metrics for each date in a region
  const getMetricForDate = (regionData, date, metric) => {
    const dateStr = formatDateString(date);
    const aggregatedData = aggregateDataByDate(regionData);
    const dayData = aggregatedData[dateStr];
    
    if (!dayData) return 0;
    
    switch (metric) {
      case 'spend':
        return dayData.spend;
      case 'installs':
        return dayData.installs;
      case 'purchases':
        return dayData.purchases;
      case 'cpi':
        return dayData.installs > 0 ? dayData.spend / dayData.installs : 0;
      case 'costPerPurchase':
        return dayData.purchases > 0 ? dayData.spend / dayData.purchases : 0;
      default:
        return 0;
    }
  };

  // Calculate total metrics for July 25th column (entire month aggregate)
  const getJul25Metric = (regionData, metric) => {
    const aggregatedData = aggregateDataByDate(regionData);
    const totalData = Object.values(aggregatedData).reduce((acc, dayData) => {
      acc.spend += dayData.spend;
      acc.installs += dayData.installs;
      acc.purchases += dayData.purchases;
      return acc;
    }, { spend: 0, installs: 0, purchases: 0 });
    
    switch (metric) {
      case 'spend':
        return totalData.spend;
      case 'installs':
        return totalData.installs;
      case 'purchases':
        return totalData.purchases;
      case 'cpi':
        return totalData.installs > 0 ? totalData.spend / totalData.installs : 0;
      case 'costPerPurchase':
        return totalData.purchases > 0 ? totalData.spend / totalData.purchases : 0;
      default:
        return 0;
    }
  };

  const formatValue = (value, metric) => {
    if (value === 0) return '₹0';
    
    switch (metric) {
      case 'spend':
      case 'cpi':
      case 'costPerPurchase':
        return formatCurrency(value);
      case 'installs':
      case 'purchases':
        return Math.round(value).toLocaleString();
      default:
        return value.toString();
    }
  };

  const getColorClass = (value, metric) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    
    // Improved color coding with better dark mode support
    if (metric === 'purchases' || metric === 'installs') {
      if (value >= 10) return 'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200';
      if (value >= 5) return 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200';
      if (value >= 1) return 'bg-orange-100 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200';
    }
    
    if (metric === 'spend') {
      if (value >= 5000) return 'bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200';
      if (value >= 1000) return 'bg-orange-100 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200';
      if (value >= 100) return 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200';
    }
    
    if (metric === 'cpi' || metric === 'costPerPurchase') {
      if (value >= 1000) return 'bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200';
      if (value >= 500) return 'bg-orange-100 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200';
      if (value >= 100) return 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200';
      if (value >= 50) return 'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200';
    }
    
    return 'bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200';
  };

  const metrics = [
    { key: 'spend', label: 'Total Spend' },
    { key: 'installs', label: 'App Installs' },
    { key: 'cpi', label: 'CPI' },
    { key: 'purchases', label: 'Purchases' },
    { key: 'costPerPurchase', label: 'Cost per Purchase' }
  ];

  // Define region display order and labels with better dark mode colors
  const getRegionSections = () => {
    if (account === "mms_af") {
      return [
        { key: 'overall', label: 'MAKEMYSONG', bgColor: 'bg-blue-100 dark:bg-blue-800/30 text-blue-900 dark:text-blue-100' },
        { key: 'india_android', label: 'FB - Android India', bgColor: 'bg-green-100 dark:bg-green-800/30 text-green-900 dark:text-green-100' },
        { key: 'india_ios', label: 'FB - iOS India', bgColor: 'bg-purple-100 dark:bg-purple-800/30 text-purple-900 dark:text-purple-100' }
      ];
    } else {
      return [
        { key: 'overall', label: 'Overall Region', bgColor: 'bg-blue-100 dark:bg-blue-800/30 text-blue-900 dark:text-blue-100' },
        { key: 'india', label: 'FB - India', bgColor: 'bg-green-100 dark:bg-green-800/30 text-green-900 dark:text-green-100' },
        { key: 'us', label: 'FB - US', bgColor: 'bg-orange-100 dark:bg-orange-800/30 text-orange-900 dark:text-orange-100' }
      ];
    }
  };

  const regionSections = getRegionSections();

  return (
    <div className="space-y-8">
      {regionSections.map((section) => {
        const regionData = data[section.key] || [];
        
        if (!regionData.length) return null;

        return (
          <div key={section.key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Region Header */}
            <div className={`${section.bgColor} p-3 rounded-t-lg`}>
              <h3 className="font-bold">{section.label}</h3>
            </div>
            
            {/* Table Container */}
            <div className="overflow-x-auto max-w-full">
              <table className="table-auto border-collapse w-full" style={{ minWidth: `${370 + (dateRange.length * 100)}px` }}>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-40 border-r border-gray-200 dark:border-gray-600">
                      Metrics
                    </th>
                    <th className="sticky left-40 z-10 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-24 border-r border-gray-200 dark:border-gray-600">
                      Summary
                    </th>
                    <th className="sticky left-64 z-10 bg-indigo-100 dark:bg-indigo-800/50 px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-28 border-r border-gray-200 dark:border-gray-600">
                      Jul25
                    </th>
                    {dateRange.map((date) => (
                      <th key={date.toISOString()} className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-24 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
                        {format(date, 'dd-MMM')}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.key} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="sticky left-0 z-20 bg-white dark:bg-gray-800 px-3 py-2 text-left font-medium text-gray-800 dark:text-gray-200 w-40 border-r border-gray-200 dark:border-gray-600">
                        {metric.label}
                      </td>
                      
                      {/* Summary Column */}
                      <td className="sticky left-40 z-10 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center font-semibold text-gray-900 dark:text-white w-24 border-r border-gray-200 dark:border-gray-600">
                        {(() => {
                          const total = dateRange.reduce((sum, date) => 
                            sum + getMetricForDate(regionData, date, metric.key), 0
                          );
                          return formatValue(total, metric.key);
                        })()}
                      </td>
                      
                      {/* July 25th Column */}
                      <td className="sticky left-64 z-10 bg-indigo-100 dark:bg-indigo-800/50 px-3 py-2 text-center text-xs font-bold text-indigo-800 dark:text-indigo-200 w-28 border-r border-gray-200 dark:border-gray-600">
                        {formatValue(getJul25Metric(regionData, metric.key), metric.key)}
                      </td>
                      
                      {/* Date Columns */}
                      {dateRange.map((date) => {
                        const value = getMetricForDate(regionData, date, metric.key);
                        return (
                          <td
                            key={`${metric.key}-${date.toISOString()}`}
                            className={`px-3 py-2 text-center text-xs font-medium w-24 border-r border-gray-200 dark:border-gray-600 ${getColorClass(value, metric.key)}`}
                          >
                            {formatValue(value, metric.key)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}