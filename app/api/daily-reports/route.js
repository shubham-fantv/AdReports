import axios from "axios";

const presetToDateRange = (preset) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  switch (preset) {
    case "today":
      return { since: formatDate(today), until: formatDate(today) };
    case "yesterday":
      return { since: formatDate(yesterday), until: formatDate(yesterday) };
    case "last_7d":
      const week = new Date(today);
      week.setDate(today.getDate() - 7);
      return { since: formatDate(week), until: formatDate(yesterday) };
    case "last_14d":
      const twoWeeks = new Date(today);
      twoWeeks.setDate(today.getDate() - 14);
      return { since: formatDate(twoWeeks), until: formatDate(yesterday) };
    case "last_28d":
      const month = new Date(today);
      month.setDate(today.getDate() - 28);
      return { since: formatDate(month), until: formatDate(yesterday) };
    case "last_30d":
      const month30 = new Date(today);
      month30.setDate(today.getDate() - 30);
      return { since: formatDate(month30), until: formatDate(yesterday) };
    default:
      return { since: formatDate(yesterday), until: formatDate(yesterday) };
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const datePreset = searchParams.get("date_preset");
  const selectedDate = searchParams.get("selected_date");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const perDay = searchParams.get("per_day") === "true";
  const account = searchParams.get("account") || "default";
  const level = searchParams.get("level") || "account";
  const fields = searchParams.get("fields");
  const breakdowns = searchParams.get("breakdowns");
  
  // Select credentials based on account
  const accessToken = account === "mms" 
    ? process.env.FACEBOOK_MMS_ACCESS_TOKEN 
    : process.env.FACEBOOK_ACCESS_TOKEN_VIDEONATION;
  const adAccountId = account === "mms" 
    ? `act_${process.env.FACEBOOK_MMS_AD_ACCOUNT_ID}`
    : process.env.FACEBOOK_AD_ACCOUNT_ID_VIDEONATION;
  
  // Validate credentials exist
  if (!accessToken || !adAccountId) {
    const accountType = account === "mms" ? "MMS" : "VideoNation";
    return new Response(
      JSON.stringify({ 
        error: `Missing ${accountType} credentials. Please check environment variables.` 
      }),
      { status: 500 }
    );
  }
  
  let since, until;
  
  if (startDate && endDate) {
    // Use start and end dates from date range picker
    since = startDate;
    until = endDate;
  } else if (selectedDate) {
    // Use selected date for both since and until
    since = selectedDate;
    until = selectedDate;
  } else {
    // Use preset date range
    const dateRange = presetToDateRange(datePreset || "yesterday");
    since = dateRange.since;
    until = dateRange.until;
  }
  
  try {
    console.log(`Making API call for ${account} account with date range: since=${since}, until=${until}, perDay=${perDay}`);
    console.log(`Access token exists: ${!!accessToken}`);
    console.log(`Ad account ID: ${adAccountId}`);
    console.log(`Level: ${level}`);
    console.log(`Fields param: ${fields}`);
    
    // Use provided fields or default based on level
    const defaultFields = level === "campaign" 
      ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
      : "ad_name,ad_id,impressions,clicks,cpc,cpm,ctr,spend,actions,reach,frequency";
    
    const finalFields = fields || defaultFields;
    console.log(`Final fields being used: ${finalFields}`);
    
    const params = new URLSearchParams({
      fields: finalFields,
      level: level,
      action_breakdowns: "action_type"
    });
    
    // Add breakdowns parameter if provided
    if (breakdowns) {
      params.append('breakdowns', breakdowns);
    }
    
    // Add time_range as separate parameters to match Facebook API format
    params.append('time_range[since]', since);
    params.append('time_range[until]', until);
    
    if (perDay) {
      params.append("time_increment", "1");
    }

    const fullUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${accessToken}&${params.toString()}`;
    console.log(`FULL Facebook API URL (with token):`, fullUrl);

    console.log(`About to make Facebook Graph API call...`);
    const { data } = await axios.get(fullUrl);
    console.log(`Facebook API call successful!`);

    console.log(`API response for ${account} (${since} to ${until}):`, JSON.stringify(data, null, 2));

    let processedCampaigns = data.data || [];

    if (level === "campaign" && perDay) {
      // For campaign level with per_day=true, return individual campaigns without aggregation
      processedCampaigns = processedCampaigns.map(item => ({
        ...item,
        // Ensure numeric values are properly formatted
        spend: parseFloat(item.spend || 0),
        impressions: parseInt(item.impressions || 0),
        clicks: parseInt(item.clicks || 0),
        ctr: parseFloat(item.ctr || 0),
        cpc: parseFloat(item.cpc || 0),
        cpm: parseFloat(item.cpm || 0),
        frequency: parseFloat(item.frequency || 0),
        // Add date field for consistency
        date: item.date_start
      }));
    } else if (level === "campaign" && !perDay) {
      // For campaign level with per_day=false, return campaigns aggregated across date range
      // Facebook API already aggregates when per_day is not specified, so just format the data
      processedCampaigns = processedCampaigns.map(item => ({
        ...item,
        // Ensure numeric values are properly formatted
        spend: parseFloat(item.spend || 0),
        impressions: parseInt(item.impressions || 0),
        clicks: parseInt(item.clicks || 0),
        ctr: parseFloat(item.ctr || 0),
        cpc: parseFloat(item.cpc || 0),
        cpm: parseFloat(item.cpm || 0),
        frequency: parseFloat(item.frequency || 0),
        // Add date field for consistency (will be date range)
        date: `${since} to ${until}`
      }));
    } else if (perDay) {
      // Aggregate by date when per_day is true for account level
      const dailyData = {};
      
      processedCampaigns.forEach(item => {
        const date = item.date_start;
        
        if (!dailyData[date]) {
          dailyData[date] = {
            campaign_name: date,
            date_start: date,
            date_stop: date,
            date: date,
            impressions: 0,
            clicks: 0,
            spend: 0,
            ctr: parseFloat(item.ctr || 0),
            cpc: parseFloat(item.cpc || 0),
            cpm: parseFloat(item.cpm || 0),
            reach: parseInt(item.reach || item.impressions || 0),
            frequency: parseFloat(item.frequency || 1),
            actions: []
          };
        } else {
          // For multiple items on same date, use weighted average for CTR
          const totalImpressions = dailyData[date].impressions + parseInt(item.impressions || 0);
          if (totalImpressions > 0) {
            dailyData[date].ctr = ((dailyData[date].ctr * dailyData[date].impressions) + (parseFloat(item.ctr || 0) * parseInt(item.impressions || 0))) / totalImpressions;
          }
        }
        
        // Aggregate metrics
        dailyData[date].impressions += parseInt(item.impressions || 0);
        dailyData[date].clicks += parseInt(item.clicks || 0);
        dailyData[date].spend += parseFloat(item.spend || 0);
        
        // Combine actions
        if (item.actions) {
          item.actions.forEach(action => {
            const existingAction = dailyData[date].actions.find(a => a.action_type === action.action_type);
            if (existingAction) {
              existingAction.value = (parseInt(existingAction.value) + parseInt(action.value)).toString();
            } else {
              dailyData[date].actions.push({ ...action });
            }
          });
        }
      });
      
      // Calculate derived metrics for each day and sort by date (preserve Facebook's CTR)
      processedCampaigns = Object.values(dailyData)
        .map(day => ({
          ...day,
          // Keep the CTR, CPC, CPM values from Facebook's response
          // Only recalculate if they're missing
          cpc: day.cpc || (day.clicks > 0 ? day.spend / day.clicks : 0),
          cpm: day.cpm || (day.impressions > 0 ? (day.spend / day.impressions) * 1000 : 0),
          reach: day.reach || day.impressions
        }))
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    } else {
      // Make a separate API call for account-level aggregate data
      const aggregateParams = new URLSearchParams({
        fields: fields || defaultFields,
        level: level,
        action_breakdowns: "action_type"
      });
      
      // Add breakdowns parameter if provided
      if (breakdowns) {
        aggregateParams.append('breakdowns', breakdowns);
      }
      
      // Add time_range as separate parameters to match Facebook API format
      aggregateParams.append('time_range[since]', since);
      aggregateParams.append('time_range[until]', until);

      console.log(`Making aggregate API call for ${account} account to:`, `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=***&${aggregateParams.toString()}`);

      const { data: aggregateData } = await axios.get(
        `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${accessToken}&${aggregateParams.toString()}`
      );

      console.log(`Aggregate API response for ${account}:`, JSON.stringify(aggregateData, null, 2));

      processedCampaigns = aggregateData.data || [];
      
      
      // Add display fields for account-level data
      processedCampaigns = processedCampaigns.map((item) => ({
        ...item,
        campaign_name: `Total (${since} to ${until})`,
        date_start: since,
        date_stop: until,
        date: since
      }));
    }

    const processedData = {
      data: {
        campaigns: processedCampaigns,
        overview: null
      }
    };

    return new Response(JSON.stringify(processedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const accountType = account === "mms" ? "MMS" : "VideoNation";
    console.error(`Error fetching ${accountType} daily reports data:`, error.message);
    console.error(`Error details:`, error.response?.data || error);
    
    // Check if it's an authentication error
    if (error.response?.status === 401 || error.message.includes('Invalid access token')) {
      return new Response(
        JSON.stringify({ 
          error: `${accountType} access token is invalid or expired. Please check credentials.` 
        }),
        { status: 401 }
      );
    }
    
    // Check for other Facebook API errors
    if (error.response?.data?.error) {
      return new Response(
        JSON.stringify({ 
          error: `Facebook API error for ${accountType}: ${error.response.data.error.message}` 
        }),
        { status: error.response.status || 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to fetch ${accountType} daily reports data: ${error.message}` 
      }),
      { status: 500 }
    );
  }
}