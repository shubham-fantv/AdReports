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
  onClearData
}) {
  
  const setDateRange = async (days, rangeKey) => {
    const today = getISTDate();
    const startDate = subDays(today, days - 1);
    
    const startDateStr = formatDateString(startDate);
    const endDateStr = formatDateString(today);
    
    setDailyStartDate(startDateStr);
    setDailyEndDate(endDateStr);
    setActiveDailyRange(rangeKey);
    
    onDateRangeChange(startDateStr, endDateStr);
  };

  const handleTodayClick = () => {
    const todayStr = getTodayIST();
    setDailyStartDate(todayStr);
    setDailyEndDate(todayStr);
    setActiveDailyRange("today");
    onDateRangeChange(todayStr, todayStr);
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
    setSelectedAccount(e.target.value);
    onClearData();
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    onClearData();
  };

  return (
    <div className="flex flex-wrap items-end gap-6 mb-8">
      {/* Account Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Account
        </label>
        <select
          value={selectedAccount}
          onChange={handleAccountChange}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="default">VideoNation</option>
          <option value="mms">MMS</option>
        </select>
      </div>

      {/* Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Level
        </label>
        <select
          value={selectedLevel}
          onChange={handleLevelChange}
          className="w-40 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="account">Account</option>
          <option value="campaign">Campaign</option>
        </select>
      </div>

      {/* Quick Date Range Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Quick Ranges
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleTodayClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeDailyRange === "today" 
                ? "bg-blue-700 text-white shadow-lg" 
                : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange(7, "last7")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeDailyRange === "last7" 
                ? "bg-blue-700 text-white shadow-lg" 
                : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange(10, "last10")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeDailyRange === "last10" 
                ? "bg-blue-700 text-white shadow-lg" 
                : "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-gray-600"
            }`}
          >
            Last 10 Days
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="flex items-end gap-3 flex-nowrap">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dailyStartDate}
            onChange={(e) => setDailyStartDate(e.target.value)}
            className="w-36 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dailyEndDate}
            onChange={(e) => setDailyEndDate(e.target.value)}
            className="w-36 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleApplyClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}