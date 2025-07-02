"use client";

const CountrySection = ({ country, data }) => {
  const countryFlag = country === "india" ? "🇮🇳" : country === "us" ? "🇺🇸" : "🌍";
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{countryFlag}</span>
        <span>{country.toUpperCase()}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(data).map(([key, val]) => (
          <div
            key={`${country}-${key}`}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-sm">📈</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {key === "average_ctr" || key === "frequency"
                ? (Math.round(val * 100) / 100).toLocaleString()
                : Math.round(val).toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
              {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OverviewCards({ overview }) {
  if (!overview) {
    return null;
  }

  console.log("OverviewCards received data:", overview);
  console.log("Has India data:", !!overview.india);
  console.log("Has US data:", !!overview.us);

  const hasCountryData = overview.india || overview.us;
  
  if (hasCountryData) {
    return (
      <div className="mt-8">
        {overview.india && (
          <CountrySection country="india" data={overview.india} />
        )}
        {overview.us && (
          <CountrySection country="us" data={overview.us} />
        )}
      </div>
    );
  }

  const data = overview.default || overview;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {Object.entries(data).map(([key, val]) => (
        <div
          key={key}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {key.replace(/_/g, " ")}
            </h3>
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm">📈</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {key === "average_ctr" || key === "frequency"
              ? (Math.round(val * 100) / 100).toLocaleString()
              : Math.round(val).toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
            {key.includes('total') ? 'Total' : key.includes('average') ? 'Average' : 'Metric'}
          </div>
        </div>
      ))}
    </div>
  );
}