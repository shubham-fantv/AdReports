// Chart data generation utilities
import { parseSpend } from "../../utils/currencyHelpers";
// Currency conversion is already handled in the API layer for MMS_AF
// So we just need to parse the spend values here

export const generateLineChartData = (chartData, theme) => {
  if (!chartData.length) return null;

  const sortedData = chartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  
  const labels = sortedData.map(item => {
    const date = new Date(item.date_start);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const spendData = sortedData.map(item => Math.round(parseSpend(item.spend)));
  const impressionsData = sortedData.map(item => parseFloat(item.impressions || 0));
  const clicksData = sortedData.map(item => parseFloat(item.clicks || 0));

  return {
    labels,
    datasets: [
      {
        label: 'Spend (₹)',
        data: spendData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0,
        fill: false,
      },
      {
        label: 'Impressions',
        data: impressionsData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0,
        fill: false,
      },
      {
        label: 'Clicks',
        data: clicksData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0,
        fill: false,
      },
    ],
  };
};

// Individual metric chart generators
export const generateIndividualMetricChart = (chartData, metric, getActionValue) => {
  if (!chartData.length) return null;

  const sortedData = chartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  
  const labels = sortedData.map(item => {
    const date = new Date(item.date_start);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  let data = [];
  let color = '';
  let label = '';

  switch (metric) {
    case 'spend':
      data = sortedData.map(item => Math.round(parseSpend(item.spend)));
      color = 'rgb(255, 0, 255)'; // Pure electric magenta
      label = 'Spend (₹)';
      break;
    case 'purchases':
      data = sortedData.map(item => getActionValue(item.actions, 'purchase'));
      color = 'rgb(128, 0, 255)'; // Pure electric violet  
      label = 'Purchases';
      break;
    case 'impressions':
      data = sortedData.map(item => parseFloat(item.impressions || 0));
      color = 'rgb(0, 255, 0)'; // Pure electric green
      label = 'Impressions';
      break;
    case 'clicks':
      data = sortedData.map(item => parseFloat(item.clicks || 0));
      color = 'rgb(0, 255, 255)'; // Pure electric cyan
      label = 'Clicks';
      break;
    case 'ctr':
      data = sortedData.map(item => parseFloat(item.ctr || 0));
      color = 'rgb(255, 255, 0)'; // Pure electric yellow
      label = 'Click Through Rate (%)';
      break;
    case 'add_to_cart':
      data = sortedData.map(item => getActionValue(item.actions, 'add_to_cart'));
      color = 'rgb(0, 255, 128)'; // Electric spring green
      label = 'Add to Cart';
      break;
    case 'checkout_initiated':
      data = sortedData.map(item => getActionValue(item.actions, 'initiate_checkout'));
      color = 'rgb(255, 128, 0)'; // Electric orange
      label = 'Checkout Initiated';
      break;
    case 'app_install':
      data = sortedData.map(item => getActionValue(item.actions, 'mobile_app_install'));
      color = 'rgb(255, 0, 128)'; // Electric pink
      label = 'App Install';
      break;
    case 'cost_per_purchase':
      data = sortedData.map(item => {
        const spend = Math.round(parseSpend(item.spend));
        const purchases = getActionValue(item.actions, 'purchase');
        return purchases > 0 ? spend / purchases : 0;
      });
      color = 'rgb(128, 0, 255)'; // Pure electric violet
      label = 'Cost Per Purchase (₹)';
      break;
    case 'user_registrations':
      data = sortedData.map(item => getActionValue(item.actions, 'complete_registration'));
      color = 'rgb(255, 0, 128)'; // Electric pink
      label = 'User Registrations';
      break;
    case 'cpm':
      data = sortedData.map(item => parseFloat(item.cpm || 0));
      color = 'rgb(255, 255, 0)'; // Pure electric yellow
      label = 'CPM (₹)';
      break;
    case 'cpc':
      data = sortedData.map(item => parseFloat(item.cpc || 0));
      color = 'rgb(0, 255, 128)'; // Electric spring green
      label = 'CPC (₹)';
      break;
    default:
      return null;
  }

  return {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };
};

export const generateCampaignChartData = (metric, campaigns, borderColor) => {
  if (!campaigns || !campaigns.length) return { labels: [], datasets: [] };

  const sortedCampaigns = campaigns.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  
  const labels = sortedCampaigns.map(campaign => {
    const date = new Date(campaign.date_start);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data = sortedCampaigns.map(campaign => {
    switch (metric) {
      case 'purchases':
        return getActionValue(campaign.actions, 'purchase');
      case 'add_to_cart':
        return getActionValue(campaign.actions, 'add_to_cart');
      case 'checkout_initiated':
        return getActionValue(campaign.actions, 'initiate_checkout');
      case 'app_install':
        return getActionValue(campaign.actions, 'mobile_app_install');
      case 'user_registrations':
        return getActionValue(campaign.actions, 'complete_registration');
      case 'cost_per_purchase':
        const spend = Math.round(parseSpend(campaign.spend));
        const purchases = getActionValue(campaign.actions, 'purchase');
        return purchases > 0 ? spend / purchases : 0;
      default:
        return parseFloat(campaign[metric] || 0);
    }
  });

  return {
    labels,
    datasets: [
      {
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data,
        borderColor,
        backgroundColor: borderColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0,
        fill: false,
      },
    ],
  };
};

export const generateAgeChartData = (ageData, getActionValue) => {
  if (!ageData.length) return null;

  // Define official Meta API age brackets
  const ageBrackets = {
    '13-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55-64': 0,
    '65+': 0,
    'unknown': 0
  };

  // Helper function to normalize age bracket from Meta API
  const normalizeAgeBracket = (age) => {
    if (!age) return 'unknown';
    
    // Age comes directly as bracket string like "45-54", just normalize the case
    const ageStr = age.toString().trim();
    
    // Check if it's a valid age bracket
    if (ageBrackets.hasOwnProperty(ageStr)) {
      return ageStr;
    }
    
    // Handle lowercase unknown
    if (ageStr.toLowerCase() === 'unknown') return 'unknown';
    
    return 'unknown';
  };

  // Aggregate purchases by age brackets
  ageData.forEach(item => {
    const age = item.age;
    const ageBracket = normalizeAgeBracket(age);
    
    // Look for purchase actions only
    const purchases = getActionValue(item.actions, 'purchase');
    
    console.log("Age processing:", { 
      ageBracket: age, 
      normalizedBracket: ageBracket, 
      purchases,
      actions: item.actions?.map(a => a.action_type),
      itemKeys: Object.keys(item)
    });
    
    ageBrackets[ageBracket] += purchases;
  });

  console.log("Final age brackets:", ageBrackets);

  // Convert to arrays and sort by purchase count
  const sortedBrackets = Object.entries(ageBrackets)
    .sort(([,a], [,b]) => b - a)
    .filter(([, purchases]) => purchases > 0); // Only show brackets with purchases

  const labels = sortedBrackets.map(([bracket]) => bracket);
  const data = sortedBrackets.map(([, purchases]) => purchases);

  return {
    labels,
    datasets: [
      {
        label: 'Purchases by Age Bracket',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',   // 13-17
          'rgba(54, 162, 235, 0.8)',   // 18-24
          'rgba(255, 205, 86, 0.8)',   // 25-34
          'rgba(75, 192, 192, 0.8)',   // 35-44
          'rgba(153, 102, 255, 0.8)',  // 45-54
          'rgba(255, 159, 64, 0.8)',   // 55-64
          'rgba(199, 199, 199, 0.8)',  // 65+
          'rgba(83, 102, 255, 0.8)'    // unknown
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
};

export const generateSpendVsPurchaseChartData = (chartData, getActionValue) => {
  if (!chartData.length) return null;

  // Sort data by date
  const sortedData = chartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  
  const labels = sortedData.map(item => {
    const date = new Date(item.date_start);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const spendData = sortedData.map(item => Math.round(parseSpend(item.spend)));
  const purchaseData = sortedData.map(item => getActionValue(item.actions, 'purchase'));

  return {
    labels,
    datasets: [
      {
        label: 'Spend (₹)',
        data: spendData,
        borderColor: 'rgb(255, 0, 255)', // Pure electric magenta
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        yAxisID: 'y',
        tension: 0,
        fill: false,
      },
      {
        label: 'Purchases',
        data: purchaseData,
        borderColor: 'rgb(0, 255, 0)', // Pure electric green
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        yAxisID: 'y1',
        tension: 0,
        fill: false,
      },
    ],
  };
};

export const generateSpendVsPurchaseScatterData = (chartData, getActionValue) => {
  if (!chartData.length) return null;

  const scatterData = chartData.map(item => {
    const spend = Math.round(parseSpend(item.spend));
    const purchases = getActionValue(item.actions, 'purchase');
    const date = new Date(item.date_start);
    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return {
      x: spend,
      y: purchases,
      label: dateLabel
    };
  });

  // Calculate trend line using linear regression
  const n = scatterData.length;
  const sumX = scatterData.reduce((sum, point) => sum + point.x, 0);
  const sumY = scatterData.reduce((sum, point) => sum + point.y, 0);
  const sumXY = scatterData.reduce((sum, point) => sum + (point.x * point.y), 0);
  const sumXX = scatterData.reduce((sum, point) => sum + (point.x * point.x), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Find min and max X values for trend line
  const minX = Math.min(...scatterData.map(point => point.x));
  const maxX = Math.max(...scatterData.map(point => point.x));

  const trendLineData = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ];

  return {
    datasets: [
      {
        label: 'Spend vs Purchases',
        data: scatterData,
        backgroundColor: 'rgba(0, 255, 255, 0.8)', // Pure electric cyan
        borderColor: 'rgb(0, 255, 255)',
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      },
      {
        label: 'Trend Line',
        data: trendLineData,
        backgroundColor: 'rgba(255, 0, 255, 0.3)', // Pure electric magenta
        borderColor: 'rgb(255, 0, 255)',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        showLine: true,
        fill: false,
        type: 'line',
      },
    ],
  };
};

export const generateClicksVsCtrChartData = (chartData) => {
  if (!chartData.length) return null;

  // Sort data by date
  const sortedData = chartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  
  const labels = sortedData.map(item => {
    const date = new Date(item.date_start);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const clicksData = sortedData.map(item => parseFloat(item.clicks || 0));
  const ctrData = sortedData.map(item => parseFloat(item.ctr || 0));

  return {
    labels,
    datasets: [
      {
        label: 'Daily Clicks',
        type: 'bar',
        data: clicksData,
        backgroundColor: 'rgba(0, 255, 0, 0.8)', // Pure electric green
        borderColor: 'rgb(0, 255, 0)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
      {
        label: 'Click-Through Rate (%)',
        type: 'line',
        data: ctrData,
        borderColor: 'rgb(255, 0, 255)', // Pure electric magenta
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        yAxisID: 'y',
        tension: 0,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
};

export const generateAgeSpendPieChartData = (ageData) => {
  if (!ageData.length) return null;

  // Define official Meta API age brackets
  const ageBrackets = {
    '13-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55-64': 0,
    '65+': 0,
    'unknown': 0
  };

  // Helper function to normalize age bracket from Meta API
  const normalizeAgeBracket = (age) => {
    if (!age) return 'unknown';
    
    const ageStr = age.toString().trim();
    
    if (ageBrackets.hasOwnProperty(ageStr)) {
      return ageStr;
    }
    
    if (ageStr.toLowerCase() === 'unknown') return 'unknown';
    
    return 'unknown';
  };

  // Aggregate spend by age brackets
  ageData.forEach(item => {
    const age = item.age;
    const ageBracket = normalizeAgeBracket(age);
    const spend = Math.round(parseSpend(item.spend));
    
    ageBrackets[ageBracket] += spend;
  });

  // Filter out age brackets with no spend and prepare data
  const filteredBrackets = Object.entries(ageBrackets)
    .filter(([, spend]) => spend > 0)
    .sort(([,a], [,b]) => b - a);

  if (filteredBrackets.length === 0) return null;

  const labels = filteredBrackets.map(([bracket]) => bracket);
  const data = filteredBrackets.map(([, spend]) => spend);

  // Define MMS age group colors based on specific brackets
  const ageColorMap = {
    '18-24': { bg: 'rgba(225, 87, 89, 0.9)', border: 'rgba(225, 87, 89, 1)' },     // Soft Red #E15759
    '25-34': { bg: 'rgba(118, 183, 178, 0.9)', border: 'rgba(118, 183, 178, 1)' }, // Teal #76B7B2
    '35-44': { bg: 'rgba(78, 121, 167, 0.9)', border: 'rgba(78, 121, 167, 1)' },   // Classic Blue #4E79A7
    '45-54': { bg: 'rgba(242, 142, 44, 0.9)', border: 'rgba(242, 142, 44, 1)' },   // Burnt Orange #F28E2C
    '55-64': { bg: 'rgba(89, 161, 79, 0.9)', border: 'rgba(89, 161, 79, 1)' },     // Forest Green #59A14F
    '65+': { bg: 'rgba(175, 122, 161, 0.9)', border: 'rgba(175, 122, 161, 1)' },   // Mauve #AF7AA1
    '13-17': { bg: 'rgba(225, 87, 89, 0.9)', border: 'rgba(225, 87, 89, 1)' },     // Fallback to Soft Red
    'unknown': { bg: 'rgba(186, 176, 171, 0.9)', border: 'rgba(186, 176, 171, 1)' } // Slate Gray #BAB0AB
  };

  const colors = labels.map(label => ageColorMap[label]?.bg || 'rgba(186, 176, 171, 0.9)');
  const borderColors = labels.map(label => ageColorMap[label]?.border || 'rgba(186, 176, 171, 1)');

  return {
    labels,
    datasets: [
      {
        label: 'Spend by Age Group',
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };
};

export const generateAgePurchasePieChartData = (ageData, getActionValue) => {
  if (!ageData.length) return null;

  // Define official Meta API age brackets
  const ageBrackets = {
    '13-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55-64': 0,
    '65+': 0,
    'unknown': 0
  };

  // Helper function to normalize age bracket from Meta API
  const normalizeAgeBracket = (age) => {
    if (!age) return 'unknown';
    
    const ageStr = age.toString().trim();
    
    if (ageBrackets.hasOwnProperty(ageStr)) {
      return ageStr;
    }
    
    if (ageStr.toLowerCase() === 'unknown') return 'unknown';
    
    return 'unknown';
  };

  // Aggregate purchases by age brackets
  ageData.forEach(item => {
    const age = item.age;
    const ageBracket = normalizeAgeBracket(age);
    const purchases = getActionValue(item.actions, 'purchase');
    
    ageBrackets[ageBracket] += purchases;
  });

  // Filter out age brackets with no purchases and prepare data
  const filteredBrackets = Object.entries(ageBrackets)
    .filter(([, purchases]) => purchases > 0)
    .sort(([,a], [,b]) => b - a);

  if (filteredBrackets.length === 0) return null;

  const labels = filteredBrackets.map(([bracket]) => bracket);
  const data = filteredBrackets.map(([, purchases]) => purchases);

  // Define MMS age group colors based on specific brackets
  const ageColorMap = {
    '18-24': { bg: 'rgba(225, 87, 89, 0.9)', border: 'rgba(225, 87, 89, 1)' },     // Soft Red #E15759
    '25-34': { bg: 'rgba(118, 183, 178, 0.9)', border: 'rgba(118, 183, 178, 1)' }, // Teal #76B7B2
    '35-44': { bg: 'rgba(78, 121, 167, 0.9)', border: 'rgba(78, 121, 167, 1)' },   // Classic Blue #4E79A7
    '45-54': { bg: 'rgba(242, 142, 44, 0.9)', border: 'rgba(242, 142, 44, 1)' },   // Burnt Orange #F28E2C
    '55-64': { bg: 'rgba(89, 161, 79, 0.9)', border: 'rgba(89, 161, 79, 1)' },     // Forest Green #59A14F
    '65+': { bg: 'rgba(175, 122, 161, 0.9)', border: 'rgba(175, 122, 161, 1)' },   // Mauve #AF7AA1
    '13-17': { bg: 'rgba(225, 87, 89, 0.9)', border: 'rgba(225, 87, 89, 1)' },     // Fallback to Soft Red
    'unknown': { bg: 'rgba(186, 176, 171, 0.9)', border: 'rgba(186, 176, 171, 1)' } // Slate Gray #BAB0AB
  };

  const colors = labels.map(label => ageColorMap[label]?.bg || 'rgba(186, 176, 171, 0.9)');
  const borderColors = labels.map(label => ageColorMap[label]?.border || 'rgba(186, 176, 171, 1)');

  return {
    labels,
    datasets: [
      {
        label: 'Purchases by Age Group',
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };
};

export const generateGenderPurchasePieChartData = (genderData, getActionValue) => {
  if (!genderData.length) return null;

  // Define gender categories
  const genderCategories = {
    'male': 0,
    'female': 0,
    'unknown': 0
  };

  // Helper function to normalize gender from Meta API
  const normalizeGender = (gender) => {
    if (!gender) return 'unknown';
    
    const genderStr = gender.toString().toLowerCase().trim();
    
    if (genderCategories.hasOwnProperty(genderStr)) {
      return genderStr;
    }
    
    return 'unknown';
  };

  // Aggregate purchases by gender
  genderData.forEach(item => {
    const gender = item.gender;
    const genderCategory = normalizeGender(gender);
    const purchases = getActionValue(item.actions, 'purchase');
    
    genderCategories[genderCategory] += purchases;
  });

  // Filter out genders with no purchases and prepare data
  const filteredGenders = Object.entries(genderCategories)
    .filter(([, purchases]) => purchases > 0)
    .sort(([,a], [,b]) => b - a);

  if (filteredGenders.length === 0) return null;

  const labels = filteredGenders.map(([gender]) => gender.charAt(0).toUpperCase() + gender.slice(1));
  const data = filteredGenders.map(([, purchases]) => purchases);

  // Define MMS gender colors based on specification
  const genderColorMap = {
    'male': { bg: 'rgba(237, 201, 73, 0.9)', border: 'rgba(237, 201, 73, 1)' },     // Golden Yellow #EDC949
    'female': { bg: 'rgba(255, 157, 167, 0.9)', border: 'rgba(255, 157, 167, 1)' }, // Warm Pink #FF9DA7
    'unknown': { bg: 'rgba(186, 176, 171, 0.9)', border: 'rgba(186, 176, 171, 1)' } // Slate Gray #BAB0AB
  };

  const colors = filteredGenders.map(([gender]) => genderColorMap[gender]?.bg || 'rgba(186, 176, 171, 0.9)');
  const borderColors = filteredGenders.map(([gender]) => genderColorMap[gender]?.border || 'rgba(186, 176, 171, 1)');

  return {
    labels,
    datasets: [
      {
        label: 'Purchases by Gender',
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };
};

export const generateGenderSpendPieChartData = (genderData) => {
  if (!genderData.length) return null;

  // Define gender categories
  const genderCategories = {
    'male': 0,
    'female': 0,
    'unknown': 0
  };

  // Helper function to normalize gender from Meta API
  const normalizeGender = (gender) => {
    if (!gender) return 'unknown';
    
    const genderStr = gender.toString().toLowerCase().trim();
    
    if (genderCategories.hasOwnProperty(genderStr)) {
      return genderStr;
    }
    
    return 'unknown';
  };

  // Aggregate spend by gender
  genderData.forEach(item => {
    const gender = item.gender;
    const genderCategory = normalizeGender(gender);
    const spend = Math.round(parseSpend(item.spend));
    
    genderCategories[genderCategory] += spend;
  });

  // Filter out genders with no spend and prepare data
  const filteredGenders = Object.entries(genderCategories)
    .filter(([, spend]) => spend > 0)
    .sort(([,a], [,b]) => b - a);

  if (filteredGenders.length === 0) return null;

  const labels = filteredGenders.map(([gender]) => gender.charAt(0).toUpperCase() + gender.slice(1));
  const data = filteredGenders.map(([, spend]) => spend);

  // Define MMS gender colors based on specification
  const genderColorMap = {
    'male': { bg: 'rgba(237, 201, 73, 0.9)', border: 'rgba(237, 201, 73, 1)' },     // Golden Yellow #EDC949
    'female': { bg: 'rgba(255, 157, 167, 0.9)', border: 'rgba(255, 157, 167, 1)' }, // Warm Pink #FF9DA7
    'unknown': { bg: 'rgba(186, 176, 171, 0.9)', border: 'rgba(186, 176, 171, 1)' } // Slate Gray #BAB0AB
  };

  const colors = filteredGenders.map(([gender]) => genderColorMap[gender]?.bg || 'rgba(186, 176, 171, 0.9)');
  const borderColors = filteredGenders.map(([gender]) => genderColorMap[gender]?.border || 'rgba(186, 176, 171, 1)');

  return {
    labels,
    datasets: [
      {
        label: 'Spend by Gender',
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };
};

// Helper function
const getActionValue = (actions, actionType) => {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find(a => a.action_type === actionType);
  return action ? parseInt(action.value || 0) : 0;
};