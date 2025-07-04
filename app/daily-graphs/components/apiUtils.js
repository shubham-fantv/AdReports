// API utility functions

export const fetchDailyData = async (
  dailyStartDate,
  dailyEndDate,
  selectedAccount,
  selectedLevel,
  setChartData,
  setAgeData,
  setGenderData,
  setDeviceData,
  setLoading
) => {
  setLoading(true);

  try {
    const params = new URLSearchParams({
      start_date: dailyStartDate,
      end_date: dailyEndDate,
      per_day: "true",
      account: selectedAccount,
      level: selectedLevel
    });
    
    const response = await fetch(`/api/daily-reports?${params}`);
    const result = await response.json();

    const allCampaigns = [];
    if (result?.data?.campaigns) {
      allCampaigns.push(...result.data.campaigns);
    }
    
    console.log("Graph data:", allCampaigns);
    const sortedData = allCampaigns.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    setChartData(sortedData);

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