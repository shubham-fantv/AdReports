"use client";

export default function AccountTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "mms_af", label: "MMS AF" },
    { key: "lf_af", label: "LF AF" }
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] mb-6">
      <div className="border-b border-gray-200 dark:border-[#2a2a2a]">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}