import { getActionValue } from "./dateHelpers";

const getCountryFromCampaignName = (campaignName) => {
  if (!campaignName) return "unknown";
  
  const name = campaignName.toLowerCase();
  
  console.log("Checking campaign name:", name);
  
  // More flexible India detection
  if (name.includes("india") || name.includes("ind") || name.includes("in_") || 
      name.includes("mumbai") || name.includes("delhi") || name.includes("bangalore") ||
      name.includes("chennai") || name.includes("kolkata") || name.includes("pune") ||
      name.includes("hyderabad") || name.includes("ahmedabad") || name.includes("jaipur")) {
    console.log("Detected as India:", name);
    return "india";
  } 
  
  // More flexible US detection
  if (name.includes("us") || name.includes("usa") || name.includes("united states") || 
      name.includes("america") || name.includes("new york") || name.includes("california") ||
      name.includes("texas") || name.includes("florida") || name.includes("chicago") ||
      name.includes("los angeles") || name.includes("boston") || name.includes("seattle")) {
    console.log("Detected as US:", name);
    return "us";
  }
  
  console.log("Could not detect country from:", name);
  return "unknown";
};

export const calculateCountryBasedOverview = (campaigns, selectedAccount, selectedLevel) => {
  if (!campaigns.length) return null;
  
  console.log("calculateCountryBasedOverview called with:", {
    selectedAccount,
    selectedLevel,
    campaignCount: campaigns.length,
    sampleCampaigns: campaigns.slice(0, 3).map(c => ({ name: c.campaign_name, country: getCountryFromCampaignName(c.campaign_name) }))
  });
  
  // TEMPORARY: Force the split for debugging - remove this condition later
  if ((selectedAccount === "mms" || selectedAccount === "default") && selectedLevel === "campaign") {
  // if (selectedAccount === "mms" && selectedLevel === "campaign") {
    const countryCampaigns = {
      india: campaigns.filter(c => getCountryFromCampaignName(c.campaign_name) === "india"),
      us: campaigns.filter(c => getCountryFromCampaignName(c.campaign_name) === "us")
    };
    
    console.log("Country filtering results:", {
      indiaCount: countryCampaigns.india.length,
      usCount: countryCampaigns.us.length,
      indiaNames: countryCampaigns.india.map(c => c.campaign_name),
      usNames: countryCampaigns.us.map(c => c.campaign_name)
    });
    
    const countryOverviews = {};
    
    Object.keys(countryCampaigns).forEach(country => {
      const countryCamps = countryCampaigns[country];
      if (countryCamps.length > 0) {
        countryOverviews[country] = calculateCustomOverview(countryCamps);
      }
    });
    
    console.log("Final country overviews:", countryOverviews);
    
    // If we have country data, return it
    if (Object.keys(countryOverviews).length > 0) {
      return countryOverviews;
    } else {
      console.log("No country data found, creating default split");
      // For debugging: Always create the split to test the UI
      const halfPoint = Math.ceil(campaigns.length / 2);
      const indiaData = calculateCustomOverview(campaigns.slice(0, halfPoint));
      const usData = calculateCustomOverview(campaigns.slice(halfPoint));
      
      console.log("Creating forced split:", { indiaData, usData });
      
      return {
        india: indiaData,
        us: usData
      };
    }
  }
  
  return { default: calculateCustomOverview(campaigns) };
};

export const calculateCustomOverview = (campaigns) => {
  if (!campaigns.length) return null;

  const totalSpend = campaigns.reduce(
    (sum, c) => sum + parseFloat(c.spend || 0),
    0
  );
  const totalImpressions = campaigns.reduce(
    (sum, c) => sum + parseInt(c.impressions || 0),
    0
  );
  const totalClicks = campaigns.reduce(
    (sum, c) => sum + parseInt(c.clicks || 0),
    0
  );
  const totalPurchase = campaigns.reduce((sum, c) => {
    return sum + getActionValue(c.actions, "purchase");
  }, 0);

  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const averageCPM =
    totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const averageCTR =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  // Use frequency from Meta API (weighted average based on impressions)
  const totalFrequencyWeighted = campaigns.reduce((sum, c) => {
    const impressions = parseInt(c.impressions || 0);
    const freq = parseFloat(c.frequency || 0);
    return sum + (impressions * freq);
  }, 0);
  const frequency = totalImpressions > 0 ? totalFrequencyWeighted / totalImpressions : 0;

  return {
    total_spend: totalSpend,
    total_impressions: totalImpressions,
    total_clicks: totalClicks,
    total_purchase: totalPurchase,
    average_cpc: averageCPC,
    average_cpm: averageCPM,
    average_ctr: averageCTR,
    frequency: frequency,
  };
};

export const calculateCampaignTotals = (campaigns) => {
  if (!campaigns.length) return null;

  const totalSpend = campaigns.reduce((sum, c) => sum + parseFloat(c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + parseInt(c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + parseInt(c.clicks || 0), 0);
  
  // Calculate weighted averages
  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const averageCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  // Calculate frequency (weighted average)
  const totalFrequencyWeighted = campaigns.reduce((sum, c) => {
    const impressions = parseInt(c.impressions || 0);
    const frequency = parseFloat(c.frequency || 0);
    return sum + (impressions * frequency);
  }, 0);
  const averageFrequency = totalImpressions > 0 ? totalFrequencyWeighted / totalImpressions : 0;

  // Aggregate actions
  const aggregatedActions = {};
  campaigns.forEach(campaign => {
    if (campaign.actions && Array.isArray(campaign.actions)) {
      campaign.actions.forEach(action => {
        if (!aggregatedActions[action.action_type]) {
          aggregatedActions[action.action_type] = 0;
        }
        aggregatedActions[action.action_type] += parseInt(action.value || 0);
      });
    }
  });

  return {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    cpc: averageCPC,
    cpm: averageCPM,
    ctr: averageCTR,
    frequency: averageFrequency,
    actions: Object.keys(aggregatedActions).map(actionType => ({
      action_type: actionType,
      value: aggregatedActions[actionType].toString()
    }))
  };
};

export const exportToCSV = (tableData, aggregateData, selectedAccount, selectedLevel, dailyStartDate, dailyEndDate) => {
  if (!tableData.length && !aggregateData) {
    alert("No data to export");
    return;
  }

  // Prepare data for CSV
  const csvData = [];
  
  // Add header row
  const baseHeaders = ["Date"];
  if (selectedLevel === "campaign") {
    baseHeaders.push("Campaign");
  }
  
  if (selectedAccount === "mms") {
    csvData.push([
      ...baseHeaders,
      "Spend (INR)",
      "Impressions",
      "Clicks",
      "CPC",
      "CPM",
      "CTR",
      "Frequency",
      "Mobile App Install",
      "Purchase",
      "Complete Registration"
    ]);
  } else {
    csvData.push([
      ...baseHeaders,
      "Spend (INR)",
      "Impressions",
      "Clicks",
      "CPC",
      "CPM",
      "CTR",
      "Frequency",
      "Add to Cart",
      "Purchase",
      "Initiate Checkout",
      "Complete Registration"
    ]);
  }

  // Add daily data rows
  tableData.forEach(item => {
    const baseRowData = [item.date_start || item.date];
    if (selectedLevel === "campaign") {
      baseRowData.push(item.campaign_name || "N/A");
    }
    
    if (selectedAccount === "mms") {
      csvData.push([
        ...baseRowData,
        Math.round(item.spend || 0),
        item.impressions || 0,
        item.clicks || 0,
        Math.round(item.cpc || 0),
        Math.round(item.cpm || 0),
        parseFloat(item.ctr || 0).toFixed(2),
        Math.round((item.frequency || 0) * 100) / 100,
        getActionValue(item.actions, "mobile_app_install"),
        getActionValue(item.actions, "purchase"),
        getActionValue(item.actions, "complete_registration")
      ]);
    } else {
      csvData.push([
        ...baseRowData,
        Math.round(item.spend || 0),
        item.impressions || 0,
        item.clicks || 0,
        Math.round(item.cpc || 0),
        Math.round(item.cpm || 0),
        parseFloat(item.ctr || 0).toFixed(2),
        Math.round((item.frequency || 0) * 100) / 100,
        getActionValue(item.actions, "add_to_cart"),
        getActionValue(item.actions, "purchase"),
        getActionValue(item.actions, "initiate_checkout"),
        getActionValue(item.actions, "complete_registration")
      ]);
    }
  });

  // Add aggregate data if available
  if (aggregateData) {
    const aggregateRowData = ["TOTAL"];
    if (selectedLevel === "campaign") {
      aggregateRowData.push("-");
    }
    
    if (selectedAccount === "mms") {
      csvData.push([
        ...aggregateRowData,
        Math.round(aggregateData.spend),
        aggregateData.impressions,
        aggregateData.clicks,
        Math.round(aggregateData.cpc),
        Math.round(aggregateData.cpm),
        parseFloat(aggregateData.ctr || 0).toFixed(2),
        Math.round((aggregateData.frequency || 0) * 100) / 100,
        getActionValue(aggregateData.actions, "mobile_app_install"),
        getActionValue(aggregateData.actions, "purchase"),
        getActionValue(aggregateData.actions, "complete_registration")
      ]);
    } else {
      csvData.push([
        ...aggregateRowData,
        Math.round(aggregateData.spend),
        aggregateData.impressions,
        aggregateData.clicks,
        Math.round(aggregateData.cpc),
        Math.round(aggregateData.cpm),
        parseFloat(aggregateData.ctr || 0).toFixed(2),
        Math.round((aggregateData.frequency || 0) * 100) / 100,
        getActionValue(aggregateData.actions, "add_to_cart"),
        getActionValue(aggregateData.actions, "purchase"),
        getActionValue(aggregateData.actions, "initiate_checkout"),
        getActionValue(aggregateData.actions, "complete_registration")
      ]);
    }
  }

  // Convert to CSV string
  const csvString = csvData.map(row => 
    row.map(field => `"${field}"`).join(",")
  ).join("\n");

  // Create and download file
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `campaign-performance-${dailyStartDate}-to-${dailyEndDate}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};