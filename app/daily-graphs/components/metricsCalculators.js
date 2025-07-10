// Metrics calculation utilities
import { parseSpend } from "../../utils/currencyHelpers";
// Currency conversion is already handled in the API layer for MMS_AF
// So we just need to parse the spend values here

export const calculateSummaryMetrics = (chartData, getActionValue, selectedAccount) => {
  if (!chartData.length) return { totalSpend: 0, totalPurchases: 0, costPerPurchase: 0 };
  
  const totalSpend = chartData.reduce((sum, item) => sum + parseSpend(item.spend), 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
  
  return { totalSpend, totalPurchases, costPerPurchase };
};

export const calculateMmsMetrics = (chartData, getActionValue, selectedAccount) => {
  if (!chartData.length) return { 
    totalSpend: 0, 
    totalSales: 0, 
    totalPurchases: 0, 
    roas: 0, 
    costPerPurchase: 0, 
    avgCpm: 0, 
    avgCpc: 0 
  };
  
  const totalSpend = chartData.reduce((sum, item) => sum + parseSpend(item.spend), 0);
  const totalPurchases = chartData.reduce((sum, item) => {
    const purchases = getActionValue(item.actions, 'purchase');
    console.log(`📦 MMS Purchase Debug - Date: ${item.date_start || item.date}, Purchases: ${purchases}, Actions:`, item.actions);
    return sum + purchases;
  }, 0);
  
  console.log('📊 MMS calculateMmsMetrics - Total Purchases:', totalPurchases);
  
  // Calculate actual sales revenue using action_value from purchase actions
  const totalSales = chartData.reduce((sum, item) => sum + getActionRevenue(item.actions, 'purchase'), 0);
  
  // Fallback: If no action_value data, use hardcoded calculation (India purchases * 499)
  const fallbackSales = totalPurchases * 499;
  
  // Use actual sales data if available, otherwise fall back to calculation
  const actualTotalSales = totalSales > 0 ? totalSales : fallbackSales;
  
  console.log('💰 MMS Revenue Calculation:');
  console.log('- Total Purchases:', totalPurchases);
  console.log('- Actual Revenue from API:', totalSales);
  console.log('- Fallback Revenue (₹499 × purchases):', fallbackSales);
  console.log('- Final Revenue Used:', actualTotalSales);
  
  const roas = totalSpend > 0 ? actualTotalSales / totalSpend : 0;
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
  
  // Calculate average CPM and CPC
  const totalImpressions = chartData.reduce((sum, item) => sum + parseFloat(item.impressions || 0), 0);
  const totalClicks = chartData.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
  
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  
  return { 
    totalSpend, 
    totalSales: actualTotalSales, 
    totalPurchases, 
    roas, 
    costPerPurchase, 
    avgCpm, 
    avgCpc 
  };
};

export const getActionValue = (actions, actionType) => {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find(a => a.action_type === actionType);
  return action ? parseInt(action.value || 0) : 0;
};

export const getActionRevenue = (actions, actionType) => {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find(a => a.action_type === actionType);
  return action ? parseFloat(action.action_value || 0) : 0;
};

export const getUniqueCampaigns = (chartData, selectedLevel) => {
  if (selectedLevel !== "campaign" || !chartData.length) return [];
  
  const campaignMap = {};
  chartData.forEach(item => {
    if (item.campaign_id && item.campaign_name) {
      if (!campaignMap[item.campaign_id]) {
        campaignMap[item.campaign_id] = {
          id: item.campaign_id,
          name: item.campaign_name,
          data: []
        };
      }
      campaignMap[item.campaign_id].data.push(item);
    }
  });
  
  return Object.values(campaignMap);
};

