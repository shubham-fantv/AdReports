"use client";

export default function DateFilters({
  startDate,
  endDate,
  activeRange,
  onStartDateChange,
  onEndDateChange,
  onQuickDateRange,
  onApplyCustomDates
}) {
  const quickRanges = [
    { label: "Today", days: 0, key: "L0" },
    { label: "Yesterday", days: 1, key: "L1" },
    { label: "L7", days: 7, key: "L7" },
    { label: "L10", days: 10, key: "L10" },
    { label: "L30", days: 30, key: "L30" },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
        
        {/* Quick Date Range Buttons */}
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Quick Ranges
          </label>
          <div className="flex flex-wrap gap-2">
            {quickRanges.map(range => (
              <button
                key={range.key}
                onClick={() => onQuickDateRange(range.days, range.key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 h-[42px] flex-shrink-0 ${
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
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full lg:w-40 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm h-[42px]"
          />
        </div>
        
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full lg:w-40 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-[#2a2a2a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] text-sm h-[42px]"
          />
        </div>
        
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 lg:opacity-0">
            Apply
          </label>
          <button
            onClick={onApplyCustomDates}
            className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm h-[42px]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}