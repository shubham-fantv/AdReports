"use client";
import { useState, useEffect } from "react";
import DateRangePicker from "./DateRangePicker";
import DataTable from "./DataTable";
import OverviewCards from "./OverviewCards";
import { getTodayIST } from "../utils/dateHelpers";
import { calculateCustomOverview, calculateCountryBasedOverview, exportToCSV } from "../utils/businessLogic";
import { apiService } from "../services/apiService";

export default function Dashboard() {
  // State management
  const [selectedAccount, setSelectedAccount] = useState("default");
  const [selectedLevel, setSelectedLevel] = useState("account");
  const [dailyStartDate, setDailyStartDate] = useState(() => getTodayIST());
  const [dailyEndDate, setDailyEndDate] = useState(() => getTodayIST());
  const [activeDailyRange, setActiveDailyRange] = useState("today");
  const [overview, setOverview] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [campaignTotals, setCampaignTotals] = useState(null);
  const [aggregateData, setAggregateData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch campaign totals
  const fetchCampaignTotals = async (startDateStr, endDateStr) => {
    if (selectedLevel !== "campaign") return null;
    
    try {
      const totals = await apiService.fetchCampaignTotals(startDateStr, endDateStr, selectedAccount);
      return totals;
    } catch (error) {
      console.error("Error fetching campaign totals:", error);
      return null;
    }
  };

  // Main data fetching function
  const fetchDailyData = async (startDateParam = null, endDateParam = null) => {
    setLoading(true);
    
    // Use parameters if provided, otherwise fall back to state
    const startDateStr = startDateParam || dailyStartDate;
    const endDateStr = endDateParam || dailyEndDate;
    
    // Debug logging for manual date selection
    if (!startDateParam && !endDateParam) {
      console.log("Manual date selection - using state values:", { startDateStr, endDateStr });
    }
    
    // Validate dates
    if (!startDateStr || !endDateStr) {
      console.error("Invalid dates:", { startDateStr, endDateStr });
      setLoading(false);
      return;
    }
    
    // Generate array of dates between start and end
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date objects:", { startDate, endDate });
      setLoading(false);
      return;
    }
    
    const dateArray = [];
    
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      dateArray.push(new Date(dt).toISOString().split('T')[0]);
    }
    
    // Generate date array for the selected range
    console.log(`Fetching ${selectedLevel} level data for dates:`, dateArray);
    
    try {
      // Make separate API call for each day
      const allPromises = dateArray.map(date => {
        const fields = selectedLevel === "campaign" 
          ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
          : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
          
        const params = new URLSearchParams({
          selected_date: date,
          per_day: "true",
          account: selectedAccount,
          level: selectedLevel,
          fields: fields
        });
        return apiService.fetchDailyReports(params);
      });
      
      // Also fetch aggregate data for the entire date range
      const aggregateFields = selectedLevel === "campaign" 
        ? "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
        : "spend,impressions,clicks,ctr,cpm,cpc,frequency,actions";
        
      const aggregateParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr,
        per_day: "false",
        account: selectedAccount,
        level: selectedLevel,
        fields: aggregateFields
      });
      const aggregatePromise = apiService.fetchDailyReports(aggregateParams);
      
      // Fetch campaign totals if in campaign level
      const campaignTotalsPromise = selectedLevel === "campaign" 
        ? fetchCampaignTotals(startDateStr, endDateStr)
        : Promise.resolve(null);
      
      const [allResults, aggregateResult, campaignTotalsResult] = await Promise.all([
        Promise.all(allPromises),
        aggregatePromise,
        campaignTotalsPromise
      ]);
      
      // Combine all campaigns from all days
      const allCampaigns = [];
      allResults.forEach(result => {
        if (result?.data?.campaigns) {
          allCampaigns.push(...result.data.campaigns);
        }
      });
      
      // Process the fetched data
      setTableData(allCampaigns);
      setCampaignTotals(campaignTotalsResult);
      
      // Calculate overview from the same daily data that's displayed in the table
      if (allCampaigns.length > 0) {
        console.log(`${selectedLevel.toUpperCase()} level data:`, {
          totalRecords: allCampaigns.length,
          sampleRecord: allCampaigns[0],
          allRecords: selectedLevel === "campaign" ? allCampaigns : "Account level - showing first record only"
        });
        
        console.log("Dashboard: About to calculate overview with:", {
          selectedAccount,
          selectedLevel,
          campaignCount: allCampaigns.length
        });
        
        const overviewFromDailyData = calculateCountryBasedOverview(allCampaigns, selectedAccount, selectedLevel);
        
        console.log("Dashboard: Calculated overview:", overviewFromDailyData);
        
        setOverview(overviewFromDailyData);
      }
      
      // Extract aggregate data correctly
      const aggregateItem = aggregateResult?.data?.campaigns?.[0];
      if (aggregateItem) {
        console.log("Setting aggregate data:", aggregateItem);
        setAggregateData(aggregateItem);
      } else {
        console.log("No aggregate data found");
        setAggregateData(null);
      }
      
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setTableData([]);
      setAggregateData(null);
      setCampaignTotals(null);
    }
    
    setLoading(false);
  };

  // Clear data function
  const clearData = () => {
    setTableData([]);
    setOverview(null);
    setAggregateData(null);
    setCampaignTotals(null);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    exportToCSV(tableData, aggregateData, selectedAccount, selectedLevel, dailyStartDate, dailyEndDate);
  };

  // Handle date range change from DateRangePicker
  const handleDateRangeChange = (startDateStr, endDateStr) => {
    fetchDailyData(startDateStr, endDateStr);
  };

  // Handle apply dates
  const handleApplyDates = () => {
    console.log("Apply button clicked - Manual date selection:", { 
      dailyStartDate, 
      dailyEndDate,
      selectedAccount,
      selectedLevel 
    });
    
    clearData();
    fetchDailyData();
  };

  // Initialize with today's data
  useEffect(() => {
    const todayStr = getTodayIST();
    
    setDailyStartDate(todayStr);
    setDailyEndDate(todayStr);
    setActiveDailyRange("today");
    
    // Load today's data immediately
    fetchDailyData(todayStr, todayStr);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Ad Reports Dashboard
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Comprehensive analytics and insights for your advertising campaigns
          </p>
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          selectedAccount={selectedAccount}
          selectedLevel={selectedLevel}
          setSelectedAccount={setSelectedAccount}
          setSelectedLevel={setSelectedLevel}
          dailyStartDate={dailyStartDate}
          dailyEndDate={dailyEndDate}
          setDailyStartDate={setDailyStartDate}
          setDailyEndDate={setDailyEndDate}
          activeDailyRange={activeDailyRange}
          setActiveDailyRange={setActiveDailyRange}
          onDateRangeChange={handleDateRangeChange}
          onApplyDates={handleApplyDates}
          onClearData={clearData}
        />


        {/* Data Table */}
        <DataTable
          tableData={tableData}
          campaignTotals={campaignTotals}
          aggregateData={aggregateData}
          selectedAccount={selectedAccount}
          selectedLevel={selectedLevel}
          loading={loading}
          onExportCSV={handleExportCSV}
        />

        {/* Overview Cards */}
        <OverviewCards overview={overview} />
      </div>
    </main>
  );
}