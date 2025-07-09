"use client";
import { getTodayIST, getISTDate, formatDateString } from "../utils/dateHelpers";
import { subDays } from 'date-fns';

export default function DateRangePicker({ 
  selectedAccount,
  selectedLevel,
  setSelectedAccount,
  setSelectedLevel,
  dailyStartDate,
  dailyEndDate,
  setDailyStartDate,
  setDailyEndDate,
  activeDailyRange,
  setActiveDailyRange,
  onDateRangeChange,
  onApplyDates,
  onClearData,
  onAccountChange
}) {
  
  const handleQuickDateRange = (days, rangeKey) => {
    const today = getISTDate();
    let startDate, endDate;
    
    if (days === 0) {
      // L0 means today only
      startDate = today;
      endDate = today;
    } else {
      // Calculate start date by subtracting days
      startDate = subDays(today, days);
      endDate = today;
    }
    
    const startDateStr = formatDateString(startDate);
    const endDateStr = formatDateString(endDate);
    
    setDailyStartDate(startDateStr);
    setDailyEndDate(endDateStr);
    setActiveDailyRange(rangeKey);
    
    onDateRangeChange(startDateStr, endDateStr);
  };

  const handleApplyClick = () => {
    console.log("Apply button clicked - Manual date selection:", { 
      dailyStartDate, 
      dailyEndDate,
      selectedAccount,
      selectedLevel 
    });
    
    onClearData();
    setActiveDailyRange("custom");
    onApplyDates();
  };

  const handleAccountChange = (e) => {
    const newAccount = e.target.value;
    console.log(`Account changing from ${selectedAccount} to ${newAccount}`);
    setSelectedAccount(newAccount);
    onClearData();
    
    // Pass the new account value to parent immediately to avoid race condition
    if (onAccountChange) {
      onAccountChange(newAccount);
    }
    
    // Note: Data refetch will be handled by useEffect in parent component
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    onClearData();
    // Refetch data if there's an active date range
    if (dailyStartDate && dailyEndDate) {
      setTimeout(() => {
        onDateRangeChange(dailyStartDate, dailyEndDate);
      }, 100);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-6 mb-6 sm:mb-8">
      {/* Account Selection */}
      <div className="sm:flex-shrink-0">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Account
        </label>
        <select
          value={selectedAccount}
          onChange={handleAccountChange}
          className="w-full sm:w-auto p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
        >
          <option value="mms_af">MMS_AF</option>
          <option value="lf_af">LF_AF</option>
          <option value="videonation_af">VideoNation_AF</option>
          <option value="photonation_af">PhotoNation_AF</option>
          <option value="default">VideoNation</option>
          <option value="mms">MMS</option>
        </select>
      </div>

      {/* Level Selection */}
      <div className="sm:flex-shrink-0">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Level
        </label>
        <select
          value={selectedLevel}
          onChange={handleLevelChange}
          className="w-full sm:w-40 p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
        >
          <option value="account">Account</option>
          <option value="campaign">Campaign</option>
        </select>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="sm:flex-shrink-0">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Quick Ranges
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "L0", days: 0, key: "L0" },
            { label: "L1", days: 1, key: "L1" },
            { label: "L7", days: 7, key: "L7" },
            { label: "L10", days: 10, key: "L10" },
            { label: "L30", days: 30, key: "L30" },
          ].map(range => (
            <button
              key={range.key}
              onClick={() => handleQuickDateRange(range.days, range.key)}
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-[auto] flex-shrink-0 ${
                activeDailyRange === range.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end lg:gap-3 gap-4 lg:flex-nowrap">
        <div className="lg:flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dailyStartDate}
            onChange={(e) => setDailyStartDate(e.target.value)}
            className="w-full lg:w-36 p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
          />
        </div>
        <div className="lg:flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dailyEndDate}
            onChange={(e) => setDailyEndDate(e.target.value)}
            className="w-full lg:w-36 p-3 sm:p-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
          />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 lg:flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 lg:opacity-0">
            Apply
          </label>
          <button
            onClick={handleApplyClick}
            className="w-full lg:w-auto px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}