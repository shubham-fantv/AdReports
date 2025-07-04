// API utility functions

export const fetchDailyData = async (
  dailyStartDate,
  dailyEndDate,
  selectedAccount,
  selectedLevel,
  selectedCountry,
  setChartData,
  setAgeData,
  setGenderData,
  setDeviceData,
  setLoading
) => {
  setLoading(true);

  try {
    // Fetch daily breakdown data for charts
    const params = new URLSearchParams({
      start_date: dailyStartDate,
      end_date: dailyEndDate,
      per_day: "true",
      account: selectedAccount,
      level: selectedLevel
    });
    
    // Add country breakdown for MMS when specific country is selected
    if (selectedAccount === "mms" && selectedCountry !== "all") {
      params.append("breakdowns", "country");
      console.log(`🌍 Adding country breakdown for MMS`);
    }
    
    console.log(`🔗 Daily API URL: /api/daily-reports?${params.toString()}`);
    const response = await fetch(`/api/daily-reports?${params}`);
    const result = await response.json();

    const allCampaigns = [];
    if (result?.data?.campaigns) {
      allCampaigns.push(...result.data.campaigns);
    }
    
    console.log("📊 Daily Graph data (per_day: true):", allCampaigns);
    
    // ALSO fetch aggregate data for overview cards (same as home page)
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
    
    // Add country breakdown for MMS aggregate data too
    if (selectedAccount === "mms" && selectedCountry !== "all") {
      aggregateParams.append("breakdowns", "country");
      console.log(`🌍 Adding country breakdown to aggregate for MMS`);
    }
    
    console.log(`🔗 Aggregate API URL: /api/daily-reports?${aggregateParams.toString()}`);
    const aggregateResponse = await fetch(`/api/daily-reports?${aggregateParams}`);
    const aggregateResult = await aggregateResponse.json();
    
    console.log("🔢 Aggregate data (per_day: false):", aggregateResult);
    
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
    console.log(`- Country filter applied: ${selectedAccount === "mms" && selectedCountry !== "all" ? selectedCountry : 'No filter'}`);
    
    // Filter data by country if specific country is selected for MMS
    let filteredChartData = allCampaigns;
    let filteredAggregateData = dataForOverviewCards;
    
    if (selectedAccount === "mms" && selectedCountry !== "all") {
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
    
    // Store both datasets - daily for charts, aggregate for cards
    const sortedData = filteredChartData.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    setChartData(sortedData);
    
    // Store aggregate data separately for overview cards with country identifier
    window.aggregateDataForCards = filteredAggregateData;
    window.currentCountryFilter = selectedCountry; // Track current country filter
    
    console.log(`🎯 Stored aggregate data for country: ${selectedCountry}`);
    console.log(`🎯 Aggregate data contains ${filteredAggregateData.length} records`);

    // Fetch age breakdown data
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
      
      // Add country breakdown for MMS age data when specific country is selected
      if (selectedAccount === "mms" && selectedCountry !== "all") {
        ageParams.append("breakdowns", "age,country");
        console.log(`🌍 Adding country breakdown to age data for MMS`);
      }
      
      const ageResponse = await fetch(`/api/daily-reports?${ageParams}`);
      const ageResult = await ageResponse.json();
      
      if (ageResult?.data?.campaigns && Array.isArray(ageResult.data.campaigns)) {
        let ageDataToUse = ageResult.data.campaigns;
        
        // Filter age data by country if specific country is selected for MMS
        if (selectedAccount === "mms" && selectedCountry !== "all") {
          const countryCodeMap = { "india": "IN", "us": "US" };
          const targetCountryCode = countryCodeMap[selectedCountry.toLowerCase()];
          
          ageDataToUse = ageResult.data.campaigns.filter(item => {
            const match = item.country === targetCountryCode;
            console.log(`📍 Age item country: ${item.country}, target: ${targetCountryCode}, match: ${match}`);
            return match;
          });
          
          console.log(`🔍 Age data filter results: ${ageResult.data.campaigns.length} -> ${ageDataToUse.length} items`);
        }
        
        console.log("Age breakdown data:", ageDataToUse);
        console.log("First age item structure:", ageDataToUse[0]);
        console.log("Age field values:", ageDataToUse.map(item => ({ age: item.age, country: item.country, allKeys: Object.keys(item) })));
        setAgeData(ageDataToUse);
      } else {
        console.log("Age data campaigns is not an array or is missing:", ageResult);
        setAgeData([]);
      }
    } catch (error) {
      console.error("Error fetching age breakdown data:", error);
      setAgeData([]);
    }

    // Fetch gender breakdown data
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
      
      // Add country breakdown for MMS gender data when specific country is selected
      if (selectedAccount === "mms" && selectedCountry !== "all") {
        genderParams.append("breakdowns", "gender,country");
        console.log(`🌍 Adding country breakdown to gender data for MMS`);
      }
      
      const genderResponse = await fetch(`/api/daily-reports?${genderParams}`);
      const genderResult = await genderResponse.json();
      
      if (genderResult?.data?.campaigns && Array.isArray(genderResult.data.campaigns)) {
        let genderDataToUse = genderResult.data.campaigns;
        
        // Filter gender data by country if specific country is selected for MMS
        if (selectedAccount === "mms" && selectedCountry !== "all") {
          const countryCodeMap = { "india": "IN", "us": "US" };
          const targetCountryCode = countryCodeMap[selectedCountry.toLowerCase()];
          
          genderDataToUse = genderResult.data.campaigns.filter(item => {
            const match = item.country === targetCountryCode;
            console.log(`📍 Gender item country: ${item.country}, target: ${targetCountryCode}, match: ${match}`);
            return match;
          });
          
          console.log(`🔍 Gender data filter results: ${genderResult.data.campaigns.length} -> ${genderDataToUse.length} items`);
        }
        
        console.log("Gender breakdown data:", genderDataToUse);
        console.log("First gender item structure:", genderDataToUse[0]);
        console.log("Gender field values:", genderDataToUse.map(item => ({ gender: item.gender, country: item.country, allKeys: Object.keys(item) })));
        setGenderData(genderDataToUse);
      } else {
        console.log("Gender data campaigns is not an array or is missing:", genderResult);
        setGenderData([]);
      }
    } catch (error) {
      console.error("Error fetching gender breakdown data:", error);
      setGenderData([]);
    }

    // Fetch device breakdown data for VideoNation only
    if (selectedAccount === "default") {
      try {
        const deviceFields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,actions"
          : "spend,impressions,clicks,ctr,actions";
          
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
    } else {
      setDeviceData([]);
    }
    
  } catch (error) {
    console.error("Error fetching daily data:", error);
    setChartData([]);
  }
  
  setLoading(false);
};