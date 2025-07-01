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
    const params = new URLSearchParams({
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      fields: "ad_name,ad_id,impressions,clicks,cpc,cpm,ctr,spend,actions",
      level: "ad",
      time_range: JSON.stringify({ since, until }),
      action_breakdowns: "action_type"
    });
    
    if (perDay) {
      params.append("time_increment", "1");
    }

    const { data } = await axios.get(
      `https://graph.facebook.com/v19.0/act_1839845276867376/insights?${params.toString()}`
    );

    let processedCampaigns = data.data || [];

    if (perDay) {
      // Aggregate by date when per_day is true
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
      // Aggregate everything into one total when per_day is false
      const totalData = {
        campaign_name: `Total (${since} to ${until})`,
        date_start: since,
        date_stop: until,
        date: since,
        impressions: 0,
        clicks: 0,
        spend: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        reach: 0,
        frequency: 1,
        actions: []
      };
      
      let totalCtrWeighted = 0;
      let totalCpcWeighted = 0;
      let totalCpmWeighted = 0;
      
      processedCampaigns.forEach(item => {
        const impressions = parseInt(item.impressions || 0);
        const clicks = parseInt(item.clicks || 0);
        const spend = parseFloat(item.spend || 0);
        
        totalData.impressions += impressions;
        totalData.clicks += clicks;
        totalData.spend += spend;
        totalData.reach += parseInt(item.reach || impressions);
        
        // Calculate weighted averages using Facebook's values
        totalCtrWeighted += parseFloat(item.ctr || 0) * impressions;
        totalCpcWeighted += parseFloat(item.cpc || 0) * clicks;
        totalCpmWeighted += parseFloat(item.cpm || 0) * impressions;
        
        // Combine actions
        if (item.actions) {
          item.actions.forEach(action => {
            const existingAction = totalData.actions.find(a => a.action_type === action.action_type);
            if (existingAction) {
              existingAction.value = (parseInt(existingAction.value) + parseInt(action.value)).toString();
            } else {
              totalData.actions.push({ ...action });
            }
          });
        }
      });
      
      // Calculate weighted averages from Facebook's values
      if (totalData.impressions > 0) {
        totalData.ctr = totalCtrWeighted / totalData.impressions;
        totalData.cpm = totalCpmWeighted / totalData.impressions;
      }
      if (totalData.clicks > 0) {
        totalData.cpc = totalCpcWeighted / totalData.clicks;
      }
      
      processedCampaigns = [totalData];
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
    console.error("Error fetching daily reports data:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch daily reports data" }),
      { status: 500 }
    );
  }
}