// API utility functions

export const fetchDailyData = async (
  dailyStartDate,
  dailyEndDate,
  selectedAccount,
  selectedLevel,
  selectedCountry,
  selectedGraphLevel,
  setChartData,
  setAgeData,
  setGenderData,
  setDeviceData,
  setLoading
) => {
  setLoading(true);

  try {
    let allCampaigns = [];

    // Special handling for MMS account level with specific country (india/us)
    if (selectedAccount === "mms" && selectedLevel === "account" && (selectedCountry === "india" || selectedCountry === "us")) {
      console.log(`🌍 Special MMS country handling for: ${selectedCountry}`);
      
      // Create date array for individual day calls
      const startDate = new Date(dailyStartDate);
      const endDate = new Date(dailyEndDate);
      const dateArray = [];
      
      for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
        dateArray.push(new Date(dt).toISOString().split('T')[0]);
      }
      
      console.log(`🗓️ Making individual calls for dates:`, dateArray);
      
      // Make individual API calls for each day with per_day=false and country breakdown
      const dailyPromises = dateArray.map(date => {
        const dayParams = new URLSearchParams({
          start_date: date,
          end_date: date,
          per_day: "false",
          account: selectedAccount,
          level: selectedLevel,
          fields: "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions",
          breakdowns: "country"
        });
        
        console.log(`🔗 Daily country API call for ${date}: /api/daily-reports?${dayParams.toString()}`);
        return fetch(`/api/daily-reports?${dayParams}`).then(res => res.json());
      });
      
      const dailyResults = await Promise.all(dailyPromises);
      
      // Process results and add date_start to each item
      dailyResults.forEach((result, index) => {
        if (result?.data?.campaigns) {
          const dateForData = dateArray[index];
          result.data.campaigns.forEach(campaign => {
            // Add date_start field for chart compatibility
            campaign.date_start = dateForData;
            campaign.date = dateForData;
          });
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      console.log("📊 MMS Country Daily Graph data (individual day calls):", allCampaigns);
      
    } else {
      // Default handling for all other cases (including MMS "all countries")
      const params = new URLSearchParams({
        start_date: dailyStartDate,
        end_date: dailyEndDate,
        per_day: "true",
        account: selectedAccount,
        level: selectedLevel
      });
      
      console.log(`🔗 Standard Daily API URL: /api/daily-reports?${params.toString()}`);
      const response = await fetch(`/api/daily-reports?${params}`);
      const result = await response.json();

      if (result?.data?.campaigns) {
        allCampaigns.push(...result.data.campaigns);
      }
      
      console.log("📊 Standard Daily Graph data (per_day: true):", allCampaigns);
    }
    
    // Fetch aggregate data for overview cards
    let aggregateResult = { data: { campaigns: [] } };
    
    // For MMS account level with specific country (india/us), use the individual day data as aggregate
    if (selectedAccount === "mms" && selectedLevel === "account" && (selectedCountry === "india" || selectedCountry === "us")) {
      console.log(`🌍 Using daily data as aggregate for MMS ${selectedCountry}`);
      // The allCampaigns already contains the country-filtered data from individual day calls
      aggregateResult = { data: { campaigns: allCampaigns } };
    } else {
      // Standard aggregate data fetch for all other cases
      const aggregateParams = new URLSearchParams({
        start_date: dailyStartDate,
        end_date: dailyEndDate,
        per_day: "false",
        account: selectedAccount,
        level: selectedLevel,
        fields: selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
          : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
      });
      
      console.log(`🔗 Standard Aggregate API URL: /api/daily-reports?${aggregateParams.toString()}`);
      const aggregateResponse = await fetch(`/api/daily-reports?${aggregateParams}`);
      aggregateResult = await aggregateResponse.json();
    }
    
    console.log("🔢 Aggregate data:", aggregateResult);
    
    // Use aggregate data for overview cards if available, otherwise fall back to daily data
    let dataForOverviewCards = allCampaigns;
    if (aggregateResult?.data?.campaigns && aggregateResult.data.campaigns.length > 0) {
      dataForOverviewCards = aggregateResult.data.campaigns;
      console.log("✅ Using aggregate data for overview cards:", dataForOverviewCards);
    } else {
      console.log("⚠️ Using daily data for overview cards (fallback):", dataForOverviewCards);
    }
    
    // Compare data quality for debugging
    const dailyPurchases = allCampaigns.reduce((sum, item) => {
      const actions = item.actions || [];
      const purchaseAction = actions.find(a => a.action_type === 'purchase');
      return sum + (purchaseAction ? parseInt(purchaseAction.value || 0) : 0);
    }, 0);
    
    const aggregatePurchases = dataForOverviewCards.reduce((sum, item) => {
      const actions = item.actions || [];
      const purchaseAction = actions.find(a => a.action_type === 'purchase');
      return sum + (purchaseAction ? parseInt(purchaseAction.value || 0) : 0);
    }, 0);
    
    console.log("🔍 DATA QUALITY CHECK:");
    console.log(`- Account: ${selectedAccount}, Level: ${selectedLevel}, Country: ${selectedCountry}`);
    console.log(`- Daily data purchases: ${dailyPurchases}`);
    console.log(`- Aggregate data purchases: ${aggregatePurchases}`);
    console.log(`- Difference: ${aggregatePurchases - dailyPurchases}`);
    console.log(`- Data source for cards: ${aggregateResult?.data?.campaigns?.length > 0 ? 'Aggregate API' : 'Daily API'}`);
    console.log(`- Country filter applied: ${selectedAccount === "mms" && selectedLevel === "account" && selectedCountry !== "all" ? selectedCountry : 'No filter'}`);
    console.log(`- Graph level applied: ${selectedAccount === "mms" && selectedLevel === "campaign" ? selectedGraphLevel : 'N/A'}`);
    
    // Filter data by country if specific country is selected for MMS account level
    let filteredChartData = allCampaigns;
    let filteredAggregateData = dataForOverviewCards;
    
    if (selectedAccount === "mms" && selectedLevel === "account" && selectedCountry !== "all") {
      console.log(`🌍 Filtering data for country: ${selectedCountry}`);
      
      // Map selected country to API country codes
      const countryCodeMap = {
        "india": "IN",
        "us": "US"
      };
      const targetCountryCode = countryCodeMap[selectedCountry.toLowerCase()];
      
      console.log(`🗺️ Country mapping: ${selectedCountry} -> ${targetCountryCode}`);
      
      // Filter chart data by country
      filteredChartData = allCampaigns.filter(item => {
        const itemCountry = item.country;
        const match = itemCountry === targetCountryCode;
        
        console.log(`📍 Chart item country: ${itemCountry}, target: ${targetCountryCode}, match: ${match}`);
        
        return match;
      });
      
      // Filter aggregate data by country
      filteredAggregateData = dataForOverviewCards.filter(item => {
        const itemCountry = item.country;
        const match = itemCountry === targetCountryCode;
        
        console.log(`📍 Aggregate item country: ${itemCountry}, target: ${targetCountryCode}, match: ${match}`);
        
        return match;
      });
      
      console.log(`🔍 Country filter results:`);
      console.log(`- Original chart data: ${allCampaigns.length} items`);
      console.log(`- Filtered chart data: ${filteredChartData.length} items`);
      console.log(`- Original aggregate data: ${dataForOverviewCards.length} items`);
      console.log(`- Filtered aggregate data: ${filteredAggregateData.length} items`);
    }
    
    // Apply graph level filtering for MMS campaign level aggregates (US/India) and platform-specific filtering
    if (selectedAccount === "mms" && selectedLevel === "campaign" && 
        (selectedGraphLevel === "us_aggregate" || selectedGraphLevel === "india_aggregate" || 
         selectedGraphLevel === "us_android" || selectedGraphLevel === "us_ios" || 
         selectedGraphLevel === "india_android" || selectedGraphLevel === "india_ios")) {
      
      // Determine target country and platform based on graph level
      let targetCountry, targetPlatform;
      if (selectedGraphLevel === "india_aggregate") {
        targetCountry = "India";
        targetPlatform = null;
      } else if (selectedGraphLevel === "us_aggregate") {
        targetCountry = "US";
        targetPlatform = null;
      } else if (selectedGraphLevel === "us_android") {
        targetCountry = "US";
        targetPlatform = "Android";
      } else if (selectedGraphLevel === "us_ios") {
        targetCountry = "US";
        targetPlatform = "iOS";
      } else if (selectedGraphLevel === "india_android") {
        targetCountry = "India";
        targetPlatform = "Android";
      } else if (selectedGraphLevel === "india_ios") {
        targetCountry = "India";
        targetPlatform = "iOS";
      }
      
      const filterLabel = targetPlatform ? `${targetCountry} ${targetPlatform}` : `${targetCountry} aggregate`;
      console.log(`🔄 Filtering MMS campaign data for ${filterLabel} based on campaign names`);
      
      // Helper function to extract country from campaign name
      const extractCountryFromCampaignName = (campaignName) => {
        if (!campaignName) return "unknown";
        const name = campaignName.toLowerCase();
        
        // Check for India patterns
        if (name.includes("india") || name.includes("| india") || name.includes("_india")) {
          return "India";
        }
        
        // Check for US patterns  
        if (name.includes("| us") || name.includes("_us") || name.includes(" us") || name.endsWith(" us")) {
          return "US";
        }
        
        return "unknown";
      };
      
      // Helper function to extract platform from campaign name
      const extractPlatformFromCampaignName = (campaignName) => {
        if (!campaignName) return "unknown";
        const name = campaignName.toLowerCase();
        
        // Check for Android patterns
        if (name.includes("android") || name.includes("google play") || name.includes("playstore")) {
          return "Android";
        }
        
        // Check for iOS patterns
        if (name.includes("ios") || name.includes("iphone") || name.includes("app store") || name.includes("appstore")) {
          return "iOS";
        }
        
        return "unknown";
      };
      
      // Filter chart data by target country and platform based on campaign names
      filteredChartData = allCampaigns.filter(item => {
        const country = extractCountryFromCampaignName(item.campaign_name);
        const platform = extractPlatformFromCampaignName(item.campaign_name);
        
        const countryMatch = country === targetCountry;
        const platformMatch = targetPlatform ? platform === targetPlatform : true;
        const match = countryMatch && platformMatch;
        
        console.log(`${match ? '✅' : '❌'} Campaign: "${item.campaign_name}" -> ${country}/${platform} (target: ${targetCountry}/${targetPlatform || 'any'})`);
        if (match) {
          console.log(`   📊 Match found - Spend: ${item.spend}, Purchases: ${item.actions?.find(a => a.action_type === 'purchase')?.value || 0}`);
        }
        return match;
      });
      
      // Filter aggregate data by target country and platform based on campaign names
      filteredAggregateData = dataForOverviewCards.filter(item => {
        const country = extractCountryFromCampaignName(item.campaign_name);
        const platform = extractPlatformFromCampaignName(item.campaign_name);
        
        const countryMatch = country === targetCountry;
        const platformMatch = targetPlatform ? platform === targetPlatform : true;
        return countryMatch && platformMatch;
      });
      
      console.log(`🔍 ${filterLabel} filtering results:`);
      console.log(`- Total campaigns: ${allCampaigns.length}`);
      console.log(`- ${filterLabel} campaigns: ${filteredChartData.length}`);
      console.log(`- Sample ${filterLabel} campaign names:`, filteredChartData.slice(0, 3).map(c => c.campaign_name));
      console.log(`- ${filterLabel} aggregate data: ${filteredAggregateData.length} items`);
      
      // Aggregate the filtered campaign data by date to create account-level style data
      const aggregatedByDate = {};
      
      filteredChartData.forEach(campaign => {
        const dateKey = campaign.date_start || campaign.date;
        
        if (!aggregatedByDate[dateKey]) {
          aggregatedByDate[dateKey] = {
            campaign_name: `${targetCountry} Aggregated`,
            campaign_id: `agg_${targetCountry.toLowerCase()}_${dateKey}`,
            date_start: dateKey,
            date: dateKey,
            spend: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cpm: 0,
            cpc: 0,
            frequency: 0,
            actions: []
          };
        }
        
        // Aggregate metrics
        aggregatedByDate[dateKey].spend += parseFloat(campaign.spend || 0);
        aggregatedByDate[dateKey].impressions += parseFloat(campaign.impressions || 0);
        aggregatedByDate[dateKey].clicks += parseFloat(campaign.clicks || 0);
        
        // Aggregate actions
        if (campaign.actions && Array.isArray(campaign.actions)) {
          campaign.actions.forEach(action => {
            const existingAction = aggregatedByDate[dateKey].actions.find(a => a.action_type === action.action_type);
            if (existingAction) {
              existingAction.value = (parseInt(existingAction.value || 0) + parseInt(action.value || 0)).toString();
              if (action.action_value) {
                existingAction.action_value = (parseFloat(existingAction.action_value || 0) + parseFloat(action.action_value || 0)).toString();
              }
            } else {
              aggregatedByDate[dateKey].actions.push({
                action_type: action.action_type,
                value: action.value || "0",
                action_value: action.action_value || "0"
              });
            }
          });
        }
      });
      
      // Calculate derived metrics for each date
      Object.values(aggregatedByDate).forEach(dateData => {
        // CTR = (clicks / impressions) * 100
        dateData.ctr = dateData.impressions > 0 ? (dateData.clicks / dateData.impressions) * 100 : 0;
        
        // CPM = (spend / impressions) * 1000
        dateData.cpm = dateData.impressions > 0 ? (dateData.spend / dateData.impressions) * 1000 : 0;
        
        // CPC = spend / clicks
        dateData.cpc = dateData.clicks > 0 ? dateData.spend / dateData.clicks : 0;
      });
      
      // Replace filtered data with aggregated data
      filteredChartData = Object.values(aggregatedByDate);
      
      console.log(`📊 Aggregated ${targetCountry} data: ${filteredChartData.length} date entries`);
      console.log(`📅 Aggregated dates:`, filteredChartData.map(item => item.date_start));
      console.log(`📊 Sample aggregated data:`, filteredChartData[0]);
    }
    
    // Store both datasets - daily for charts, aggregate for cards
    const sortedData = filteredChartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    setChartData(sortedData);
    
    // Store aggregate data separately for overview cards
    window.aggregateDataForCards = filteredAggregateData;
    window.currentCountryFilter = selectedCountry; // Track current country filter
    window.currentGraphLevel = selectedGraphLevel; // Track current graph level
    
    console.log(`🎯 Stored aggregate data for context: ${selectedLevel === "campaign" ? selectedGraphLevel : selectedCountry}`);
    console.log(`🎯 Aggregate data contains ${filteredAggregateData.length} records`);

    // Fetch age breakdown data (skip if using country breakdown due to API limitations)
    const skipAgeData = selectedAccount === "mms" && selectedLevel === "account" && selectedCountry !== "all";
    
    if (!skipAgeData) {
      try {
        const ageFields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,actions"
          : "spend,impressions,clicks,actions";
          
        const ageParams = new URLSearchParams({
          start_date: dailyStartDate,
          end_date: dailyEndDate,
          per_day: "false",
          account: selectedAccount,
          level: selectedLevel,
          fields: ageFields,
          breakdowns: "age"
        });
        
        console.log(`🔗 Age API URL: /api/daily-reports?${ageParams.toString()}`);
        const ageResponse = await fetch(`/api/daily-reports?${ageParams}`);
        const ageResult = await ageResponse.json();
        
        if (ageResult?.data?.campaigns && Array.isArray(ageResult.data.campaigns)) {
          console.log("Age breakdown data:", ageResult.data.campaigns);
          console.log("First age item structure:", ageResult.data.campaigns[0]);
          console.log("Age field values:", ageResult.data.campaigns.map(item => ({ age: item.age, allKeys: Object.keys(item) })));
          setAgeData(ageResult.data.campaigns);
        } else {
          console.log("Age data campaigns is not an array or is missing:", ageResult);
          setAgeData([]);
        }
      } catch (error) {
        console.error("Error fetching age breakdown data:", error);
        setAgeData([]);
      }
    } else {
      console.log("⚠️ Skipping age data fetch due to country breakdown conflict");
      setAgeData([]);
    }

    // Fetch gender breakdown data (skip if using country breakdown due to API limitations)
    const skipGenderData = selectedAccount === "mms" && selectedLevel === "account" && selectedCountry !== "all";
    
    if (!skipGenderData) {
      try {
        const genderFields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,actions"
          : "spend,impressions,clicks,actions";
          
        const genderParams = new URLSearchParams({
          start_date: dailyStartDate,
          end_date: dailyEndDate,
          per_day: "false",
          account: selectedAccount,
          level: selectedLevel,
          fields: genderFields,
          breakdowns: "gender"
        });
        
        console.log(`🔗 Gender API URL: /api/daily-reports?${genderParams.toString()}`);
        const genderResponse = await fetch(`/api/daily-reports?${genderParams}`);
        const genderResult = await genderResponse.json();
        
        if (genderResult?.data?.campaigns && Array.isArray(genderResult.data.campaigns)) {
          console.log("Gender breakdown data:", genderResult.data.campaigns);
          console.log("First gender item structure:", genderResult.data.campaigns[0]);
          console.log("Gender field values:", genderResult.data.campaigns.map(item => ({ gender: item.gender, allKeys: Object.keys(item) })));
          setGenderData(genderResult.data.campaigns);
        } else {
          console.log("Gender data campaigns is not an array or is missing:", genderResult);
          setGenderData([]);
        }
      } catch (error) {
        console.error("Error fetching gender breakdown data:", error);
        setGenderData([]);
      }
    } else {
      console.log("⚠️ Skipping gender data fetch due to country breakdown conflict");
      setGenderData([]);
    }

    // Fetch placement breakdown data for MMS campaign level only (all countries)
    if (selectedAccount === "mms" && selectedLevel === "campaign" && selectedCountry === "all") {
      try {
        const placementFields = "campaign_id,campaign_name,spend,impressions,clicks,actions";
        
        const placementParams = new URLSearchParams({
          start_date: dailyStartDate,
          end_date: dailyEndDate,
          per_day: "false",
          account: selectedAccount,
          level: selectedLevel,
          fields: placementFields,
          breakdowns: "publisher_platform,platform_position"
        });
        
        console.log(`🔗 Placement API URL: /api/daily-reports?${placementParams.toString()}`);
        const placementResponse = await fetch(`/api/daily-reports?${placementParams}`);
        const placementResult = await placementResponse.json();
        
        if (placementResult?.data?.campaigns && Array.isArray(placementResult.data.campaigns)) {
          console.log("Placement breakdown data:", placementResult.data.campaigns);
          console.log("First placement item structure:", placementResult.data.campaigns[0]);
          console.log("Placement field values:", placementResult.data.campaigns.map(item => ({ 
            publisher_platform: item.publisher_platform, 
            platform_position: item.platform_position,
            allKeys: Object.keys(item) 
          })));
          setDeviceData(placementResult.data.campaigns); // Reuse deviceData state for placement data
        } else {
          console.log("Placement data campaigns is not an array or is missing:", placementResult);
          setDeviceData([]);
        }
      } catch (error) {
        console.error("Error fetching placement breakdown data:", error);
        setDeviceData([]);
      }
    } else if (selectedAccount === "default") {
      // For VideoNation: fetch device breakdown for account level, placement breakdown for campaign level
      if (selectedLevel === "campaign") {
        // Fetch placement breakdown data for VideoNation campaign level
        try {
          const placementFields = "campaign_id,campaign_name,spend,impressions,clicks,actions";
          
          const placementParams = new URLSearchParams({
            start_date: dailyStartDate,
            end_date: dailyEndDate,
            per_day: "false",
            account: selectedAccount,
            level: selectedLevel,
            fields: placementFields,
            breakdowns: "publisher_platform,platform_position"
          });
          
          console.log(`🔗 VideoNation Placement API URL: /api/daily-reports?${placementParams.toString()}`);
          const placementResponse = await fetch(`/api/daily-reports?${placementParams}`);
          const placementResult = await placementResponse.json();
          
          if (placementResult?.data?.campaigns && Array.isArray(placementResult.data.campaigns)) {
            console.log("VideoNation Placement breakdown data:", placementResult.data.campaigns);
            console.log("First VideoNation placement item structure:", placementResult.data.campaigns[0]);
            console.log("VideoNation Placement field values:", placementResult.data.campaigns.map(item => ({ 
              publisher_platform: item.publisher_platform, 
              platform_position: item.platform_position,
              allKeys: Object.keys(item) 
            })));
            setDeviceData(placementResult.data.campaigns); // Reuse deviceData state for placement data
          } else {
            console.log("VideoNation Placement data campaigns is not an array or is missing:", placementResult);
            setDeviceData([]);
          }
        } catch (error) {
          console.error("Error fetching VideoNation placement breakdown data:", error);
          setDeviceData([]);
        }
      } else {
        // Fetch device breakdown data for VideoNation account level only
        try {
          const deviceFields = "spend,impressions,clicks,ctr,actions";
            
          const deviceParams = new URLSearchParams({
            start_date: dailyStartDate,
            end_date: dailyEndDate,
            per_day: "false",
            account: selectedAccount,
            level: selectedLevel,
            fields: deviceFields,
            breakdowns: "device_platform"
          });
          
          const deviceResponse = await fetch(`/api/daily-reports?${deviceParams}`);
          const deviceResult = await deviceResponse.json();
          
          if (deviceResult?.data?.campaigns && Array.isArray(deviceResult.data.campaigns)) {
            console.log("Device breakdown data:", deviceResult.data.campaigns);
            console.log("First device item structure:", deviceResult.data.campaigns[0]);
            console.log("Device field values:", deviceResult.data.campaigns.map(item => ({ device_platform: item.device_platform, allKeys: Object.keys(item) })));
            setDeviceData(deviceResult.data.campaigns);
          } else {
            console.log("Device data campaigns is not an array or is missing:", deviceResult);
            setDeviceData([]);
          }
        } catch (error) {
          console.error("Error fetching device breakdown data:", error);
          setDeviceData([]);
        }
      }
    } else {
      setDeviceData([]);
    }
    
  } catch (error) {
    console.error("Error fetching daily data:", error);
    setChartData([]);
  }
  
  setLoading(false);
};