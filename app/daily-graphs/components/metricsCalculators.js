// Metrics calculation utilities

export const calculateSummaryMetrics = (chartData, getActionValue) => {
  if (!chartData.length) return { totalSpend: 0, totalPurchases: 0, costPerPurchase: 0 };
  
  const totalSpend = chartData.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
  
  return { totalSpend, totalPurchases, costPerPurchase };
};

export const calculateMmsMetrics = (chartData, getActionValue) => {
  if (!chartData.length) return { 
    totalSpend: 0, 
    totalSales: 0, 
    totalPurchases: 0, 
    roas: 0, 
    costPerPurchase: 0, 
    avgCpm: 0, 
    avgCpc: 0 
  };
  
  const totalSpend = chartData.reduce((sum, item) => sum + parseFloat(item.spend || 0), 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + getActionValue(item.actions, 'purchase'), 0);
  
  // Calculate sales: India purchases * 499, US purchases * 1700
  // For now, assume all purchases are India (can be enhanced with geo data later)
  const totalSales = totalPurchases * 499; // Assuming all are India purchases for now
  
  const roas = totalSpend > 0 ? totalSales / totalSpend : 0;
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
  
  // Calculate average CPM and CPC
  const totalImpressions = chartData.reduce((sum, item) => sum + parseFloat(item.impressions || 0), 0);
  const totalClicks = chartData.reduce((sum, item) => sum + parseFloat(item.clicks || 0), 0);
  
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  
  return { 
    totalSpend, 
    totalSales, 
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