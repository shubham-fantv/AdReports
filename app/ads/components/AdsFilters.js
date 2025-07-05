"use client";

export default function AdsFilters({
  selectedAccount,
  onAccountChange,
  dailyStartDate,
  setDailyStartDate,
  dailyEndDate,
  setDailyEndDate,
  activeRange,
  onQuickDateRange,
  onApplyDates
}) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
      
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-6">
        {/* Account Selection */}
        <div className="sm:flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Account
          </label>
          <select
            value={selectedAccount}
            onChange={onAccountChange}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm sm:text-base min-h-[44px]"
          >
            <option value="default">VideoNation</option>
            <option value="mms">MMS</option>
          </select>
        </div>

        {/* Date Range Quick Buttons */}
        <div className="sm:flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Quick Ranges
          </label>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {[
              { label: "L0", days: 0, key: "L0" },
              { label: "L1", days: 1, key: "L1" },
              { label: "L7", days: 7, key: "L7" },
              { label: "L10", days: 10, key: "L10" },
              { label: "L30", days: 30, key: "L30" },
            ].map(range => (
              <button
                key={range.key}
                onClick={() => onQuickDateRange(range.days, range.key)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-[auto] ${
                  activeRange === range.key
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-4 lg:flex-1 gap-4">
          <div className="lg:flex-1">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dailyStartDate}
              onChange={(e) => setDailyStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <div className="lg:flex-1">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dailyEndDate}
              onChange={(e) => setDailyEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 lg:flex-shrink-0 lg:flex lg:flex-col">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 lg:opacity-0">
              Apply
            </label>
            <button
              onClick={onApplyDates}
              className="w-full lg:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}