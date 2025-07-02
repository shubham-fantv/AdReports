export const apiService = {
  // Authentication API calls
  login: async (username, password) => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Preset data API call
  fetchPresetData: async (presetDate, selectedAccount, selectedLevel) => {
    const fields = selectedLevel === "campaign" 
      ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
      : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
    
    const res = await fetch(`/api/dashboard?date_preset=${presetDate}&account=${selectedAccount}&level=${selectedLevel}&fields=${fields}`);
    return res.json();
  },

  // Daily data API call
  fetchDailyReports: async (params) => {
    const response = await fetch(`/api/daily-reports?${params}`);
    return response.json();
  },

  // Custom data API call
  fetchCustomData: async (startDate, endDate, selectedAccount, selectedLevel) => {
    const fields = selectedLevel === "campaign" 
      ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
      : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
    
    const res = await fetch(`/api/custom?start=${startDate}&end=${endDate}&account=${selectedAccount}&level=${selectedLevel}&fields=${fields}`);
    return res.json();
  },

  // Campaign totals API call
  fetchCampaignTotals: async (startDate, endDate, selectedAccount) => {
    try {
      const fields = "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        per_day: "false",
        account: selectedAccount,
        level: "campaign",
        fields: fields
      });
      
      const response = await fetch(`/api/daily-reports?${params}`);
      const result = await response.json();
      return result?.data?.campaigns || [];
    } catch (error) {
      console.error("Error fetching campaign totals:", error);
      return [];
    }
  }
};