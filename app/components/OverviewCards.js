"use client";
// Currency conversion is already handled in the API layer for MMS_AF
// So we just need to parse the spend values here

const CountrySection = ({ country, data, selectedAccount }) => {
  const countryFlag = country === "india" ? "🇮🇳" : country === "us" ? "🇺🇸" : "🌍";
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{countryFlag}</span>
        <span>{country.toUpperCase()}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(data).map(([key, val]) => (
          <div
            key={`${country}-${key}`}
            className="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg dark:hover:border-[#3a3a3a] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                <span className="text-white text-xs sm:text-sm">📈</span>
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {key === "average_ctr"
                ? (Math.round(val * 100) / 100).toLocaleString()
                : key === "cost_per_purchase"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : key === "total_spend"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : Math.round(val).toLocaleString()}
            </p>
            <div className="mt-1 sm:mt-2 text-xs text-gray-700 dark:text-gray-200">
              {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlatformSection = ({ platform, data, selectedAccount }) => {
  const platformIcon = platform === "android" ? "🤖" : platform === "ios" ? "🍎" : "📱";
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{platformIcon}</span>
        <span>{platform.toUpperCase()}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(data).map(([key, val]) => (
          <div
            key={`${platform}-${key}`}
            className="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg dark:hover:border-[#3a3a3a] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                <span className="text-white text-xs sm:text-sm">📈</span>
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {key === "average_ctr"
                ? (Math.round(val * 100) / 100).toLocaleString()
                : key === "cost_per_purchase"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : key === "total_spend"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : Math.round(val).toLocaleString()}
            </p>
            <div className="mt-1 sm:mt-2 text-xs text-gray-700 dark:text-gray-200">
              {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CombinedSection = ({ category, data, selectedAccount }) => {
  // Parse the category (e.g., "india_android" -> "India Android")
  const [country, platform] = category.split('_');
  const countryFlag = country === "india" ? "🇮🇳" : country === "us" ? "🇺🇸" : "🌍";
  const platformIcon = platform === "android" ? "🤖" : platform === "ios" ? "🍎" : "📱";
  const displayName = `${country.toUpperCase()} ${platform.toUpperCase()}`;
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{countryFlag}</span>
        <span>{platformIcon}</span>
        <span>{displayName}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(data).map(([key, val]) => (
          <div
            key={`${category}-${key}`}
            className="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg dark:hover:border-[#3a3a3a] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
                <span className="text-white text-xs sm:text-sm">📈</span>
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {key === "average_ctr"
                ? (Math.round(val * 100) / 100).toLocaleString()
                : key === "cost_per_purchase"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : key === "total_spend"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : Math.round(val).toLocaleString()}
            </p>
            <div className="mt-1 sm:mt-2 text-xs text-gray-700 dark:text-gray-200">
              {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompleteOverallSection = ({ data, selectedAccount }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🌍</span>
        <span>📊</span>
        <span>COMPLETE OVERALL</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Object.entries(data).map(([key, val]) => (
          <div
            key={`complete-${key}`}
            className="bg-white dark:bg-[#1a1a1a] p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg dark:hover:border-[#3a3a3a] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-sm">📈</span>
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {key === "average_ctr"
                ? (Math.round(val * 100) / 100).toLocaleString()
                : key === "cost_per_purchase"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : key === "total_spend"
                ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
                : Math.round(val).toLocaleString()}
            </p>
            <div className="mt-1 sm:mt-2 text-xs text-gray-700 dark:text-gray-200">
              {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OverviewCards({ overview, selectedAccount }) {
  if (!overview) {
    return null;
  }

  // Calculate total spend across all sections for the current date range
  const calculateTotalSpend = (overviewData) => {
    let totalSpend = 0;
    
    // If overview data is null or undefined, return 0
    if (!overviewData || typeof overviewData !== 'object') {
      return 0;
    }
    
    // Check if this is a direct data object (has total_spend directly)
    if (overviewData.hasOwnProperty('total_spend')) {
      const directSpend = Number(overviewData.total_spend) || 0;
      // Apply currency conversion for MMS_AF
      const convertedSpend = parseFloat(directSpend || 0);
      totalSpend += convertedSpend;
    }
    
    // Check all possible nested data sections and sum their total_spend
    const sections = [
      overviewData.india_android,
      overviewData.india_ios,
      overviewData.us_android,
      overviewData.us_ios,
      overviewData.india_overall,
      overviewData.us_overall,
      overviewData.android_overall,
      overviewData.ios_overall,
      overviewData.complete_overall,
      overviewData.india,
      overviewData.us,
      overviewData.android,
      overviewData.ios,
      overviewData.default
    ];
    
    sections.forEach(section => {
      if (section && typeof section === 'object' && section.total_spend) {
        const sectionSpend = Number(section.total_spend) || 0;
        // Apply currency conversion for MMS_AF
        const convertedSpend = parseFloat(sectionSpend || 0);
        totalSpend += convertedSpend;
      }
    });
    
    return totalSpend;
  };

  const totalSpend = calculateTotalSpend(overview);
  
  // Hide all overview cards if total spend for this date range is zero
  if (totalSpend === 0) {
    return null;
  }

  // Check for MMS filtered data (combined, platform, or country overall)
  const hasMmsFilteredData = overview.india_android || overview.india_ios || 
                             overview.us_android || overview.us_ios ||
                             overview.india_overall || overview.us_overall ||
                             overview.android_overall || overview.ios_overall ||
                             overview.complete_overall;
  
  if (hasMmsFilteredData) {
    return (
      <div className="mt-8">
        {overview.complete_overall && (
          <CompleteOverallSection data={overview.complete_overall} selectedAccount={selectedAccount} />
        )}
        {overview.india_android && (
          <CombinedSection category="india_android" data={overview.india_android} selectedAccount={selectedAccount} />
        )}
        {overview.india_ios && (
          <CombinedSection category="india_ios" data={overview.india_ios} selectedAccount={selectedAccount} />
        )}
        {overview.us_android && (
          <CombinedSection category="us_android" data={overview.us_android} selectedAccount={selectedAccount} />
        )}
        {overview.us_ios && (
          <CombinedSection category="us_ios" data={overview.us_ios} selectedAccount={selectedAccount} />
        )}
        {overview.india_overall && (
          <CountrySection country="india" data={overview.india_overall} selectedAccount={selectedAccount} />
        )}
        {overview.us_overall && (
          <CountrySection country="us" data={overview.us_overall} selectedAccount={selectedAccount} />
        )}
        {overview.android_overall && (
          <PlatformSection platform="android" data={overview.android_overall} selectedAccount={selectedAccount} />
        )}
        {overview.ios_overall && (
          <PlatformSection platform="ios" data={overview.ios_overall} selectedAccount={selectedAccount} />
        )}
      </div>
    );
  }

  // Check for platform data (Android/iOS) - for MMS if no combined data
  const hasPlatformData = overview.android || overview.ios;
  
  if (hasPlatformData) {
    return (
      <div className="mt-8">
        {overview.android && (
          <PlatformSection platform="android" data={overview.android} selectedAccount={selectedAccount} />
        )}
        {overview.ios && (
          <PlatformSection platform="ios" data={overview.ios} selectedAccount={selectedAccount} />
        )}
      </div>
    );
  }

  // Check for country data (India/US) - for Videonation  
  const hasCountryData = overview.india || overview.us;
  
  if (hasCountryData) {
    return (
      <div className="mt-8">
        {overview.india && (
          <CountrySection country="india" data={overview.india} selectedAccount={selectedAccount} />
        )}
        {overview.us && (
          <CountrySection country="us" data={overview.us} selectedAccount={selectedAccount} />
        )}
      </div>
    );
  }

  // Default single section for account level
  const data = overview.default || overview;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
      {Object.entries(data).map(([key, val]) => (
        <div
          key={key}
          className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
              {key.replace(/_/g, " ")}
            </h3>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0">
              <span className="text-white text-xs sm:text-sm">📈</span>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {key === "average_ctr"
              ? (Math.round(val * 100) / 100).toLocaleString()
              : key === "cost_per_purchase"
              ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
              : key === "total_spend"
              ? `₹${Math.round(parseFloat(val || 0)).toLocaleString()}`
              : Math.round(val).toLocaleString()}
          </p>
          <div className="mt-1 sm:mt-2 text-xs text-gray-700 dark:text-gray-200">
            {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
          </div>
        </div>
      ))}
    </div>
  );
}