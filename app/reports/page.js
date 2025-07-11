"use client";
import React, { useEffect, useState } from "react";
import { subDays } from 'date-fns';
import { getISTDate, formatDateString } from "../utils/dateHelpers";
import { groupCampaignsByRegion } from "./utils/reportHelpers";
import UnifiedHeader from '../components/UnifiedHeader';
import LoginForm from '../components/LoginForm';
import DateFilters from './components/DateFilters';
import AccountTabs from './components/AccountTabs';
import ReportTable from './components/ReportTable';
import { useMobileMenu } from '../contexts/MobileMenuContext';

export default function Reports() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Report state
  const [activeTab, setActiveTab] = useState("mms_af");
  const [reportData, setReportData] = useState({});
  
  // Date state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRange, setActiveRange] = useState("L7");

  // Mobile menu state from context
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      // Set default date range (L7 - last 7 days)
      const today = getISTDate();
      const weekAgo = subDays(today, 7);
      const startDateStr = formatDateString(weekAgo);
      const endDateStr = formatDateString(today);
      
      setStartDate(startDateStr);
      setEndDate(endDateStr);
      
      fetchReportData(startDateStr, endDateStr);
    }
  }, []);

  const fetchReportData = async (startDateParam = null, endDateParam = null) => {
    setLoading(true);
    const startDateStr = startDateParam || startDate;
    const endDateStr = endDateParam || endDate;
    
    if (!startDateStr || !endDateStr) {
      console.error("Invalid dates:", { startDateStr, endDateStr });
      setLoading(false);
      return;
    }
    
    try {
      // Fetch campaign-level data for both MMS_AF and LF_AF
      const accounts = ["mms_af", "lf_af"];
      const promises = accounts.map(async (account) => {
        const params = new URLSearchParams({
          start_date: startDateStr,
          end_date: endDateStr,
          per_day: "true",
          account: account,
          level: "campaign",
          fields: "campaign_name,spend,impressions,clicks,ctr,cpm,cpc,frequency,actions"
        });
        
        const response = await fetch(`/api/daily-reports?${params}`);
        const result = await response.json();
        
        return {
          account,
          data: result?.data?.campaigns || []
        };
      });
      
      const results = await Promise.all(promises);
      const dataMap = {};
      
      results.forEach(({ account, data }) => {
        // Group campaigns by region and platform
        dataMap[account] = groupCampaignsByRegion(data, account);
      });
      
      setReportData(dataMap);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
    
    setLoading(false);
  };

  const handleQuickDateRange = (days, rangeKey) => {
    const today = getISTDate();
    let rangeStartDate, rangeEndDate;
    
    if (days === 0) {
      // L0 means today only
      rangeStartDate = today;
      rangeEndDate = today;
    } else if (days === 1) {
      // L1 means yesterday only
      rangeStartDate = subDays(today, 1);
      rangeEndDate = subDays(today, 1);
    } else {
      // L7, L10, L30 means from X days ago to today
      rangeStartDate = subDays(today, days);
      rangeEndDate = today;
    }
    
    const startDateStr = formatDateString(rangeStartDate);
    const endDateStr = formatDateString(rangeEndDate);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setActiveRange(rangeKey);
    
    fetchReportData(startDateStr, endDateStr);
  };

  const handleApplyCustomDates = () => {
    setActiveRange("custom");
    fetchReportData();
  };

  const handleLogin = (credentials) => {
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Set default date range after login
      const today = getISTDate();
      const weekAgo = subDays(today, 7);
      const startDateStr = formatDateString(weekAgo);
      const endDateStr = formatDateString(today);
      
      setStartDate(startDateStr);
      setEndDate(endDateStr);
      
      fetchReportData(startDateStr, endDateStr);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setReportData({});
  };

  if (!mounted) {
    return null;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <button className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200">
            🌙
          </button>
        </div>
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <UnifiedHeader 
        currentPage="reports"
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Date Filters */}
        <DateFilters 
          startDate={startDate}
          endDate={endDate}
          activeRange={activeRange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onQuickDateRange={handleQuickDateRange}
          onApplyCustomDates={handleApplyCustomDates}
        />

        {/* Account Tabs */}
        <AccountTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Report Content */}
        <div className="p-6 bg-white dark:bg-[#1a1a1a] rounded-b-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading report data...</span>
            </div>
          ) : (
            <ReportTable 
              data={reportData[activeTab] || {}}
              account={activeTab}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      </main>
    </div>
  );
}