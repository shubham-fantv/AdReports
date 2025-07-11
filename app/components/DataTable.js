"use client";
import { getActionValue } from "../utils/dateHelpers";
import { parseSpend, formatCurrency } from "../utils/currencyHelpers";

// Helper function to check if account is MMS-type (mms or mms_af)
const isMmsAccount = (account) => account === "mms" || account === "mms_af";

export default function DataTable({
  tableData,
  campaignTotals,
  aggregateData,
  selectedAccount,
  selectedLevel,
  loading,
  onExportCSV
}) {
  if (loading) {
    return (
      <div className="mb-8 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="text-blue-800 dark:text-white font-semibold text-lg">Loading Analytics Data</p>
            <p className="text-blue-700 dark:text-gray-200 text-sm mt-1">Fetching campaign performance metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Campaign Performance</h2>
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Detailed analytics and metrics</p>
          </div>
          <button
            onClick={onExportCSV}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <span>📈</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
        <table className="w-full relative min-w-[1000px]">
          <thead className="bg-gray-50 dark:bg-[#0f0f0f]">
            <tr>
              <th className="sticky left-0 z-10 px-3 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-32 bg-gray-50 dark:bg-[#0f0f0f] border-r border-gray-200 dark:border-gray-700">Date</th>
              {selectedLevel === "campaign" && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Campaign</th>
              )}
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Spend</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Impressions</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Clicks</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CPC</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CPM</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">CTR</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Frequency</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cost per Purchase</th>
              {isMmsAccount(selectedAccount) ? (
                <>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">App Install</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Purchase</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cost per Purchase</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Add to Cart</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Purchase</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Checkout</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cost per Purchase</th>
                </>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-transparent">
            {tableData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group">
                <td className="sticky left-0 z-10 px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white w-32 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700 transition-colors duration-150">
                  {item.date_start || item.date}
                </td>
                {selectedLevel === "campaign" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.campaign_name || "N/A"}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right font-medium">
                  {formatCurrency(item.spend)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  {parseInt(item.impressions).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  {parseInt(item.clicks).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  ₹{Math.round(item.cpc).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  ₹{Math.round(item.cpm).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  {parseFloat(item.ctr || 0).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  {(Math.round((item.frequency || 0) * 100) / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                  {(() => {
                    const purchases = getActionValue(item.actions, "purchase");
                    const spend = parseSpend(item.spend);
                    return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                  })()}
                </td>
                {isMmsAccount(selectedAccount) ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "mobile_app_install").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "purchase").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "complete_registration").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {(() => {
                        const purchases = getActionValue(item.actions, "purchase");
                        const spend = parseSpend(item.spend);
                        return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                      })()}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "add_to_cart").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "purchase").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "initiate_checkout").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {getActionValue(item.actions, "complete_registration").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-right">
                      {(() => {
                        const purchases = getActionValue(item.actions, "purchase");
                        const spend = parseSpend(item.spend);
                        return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                      })()}
                    </td>
                  </>
                )}
              </tr>
            ))}
              
            {/* Campaign Totals Rows - Show aggregate for each campaign */}
            {campaignTotals && selectedLevel === "campaign" && Array.isArray(campaignTotals) && (
              <>
                {campaignTotals.map((campaign, idx) => (
                  <tr key={`total-${idx}`} className="bg-blue-500 dark:bg-blue-900 border-b border-blue-400 dark:border-blue-800">
                    <td className="sticky left-0 z-10 px-3 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white w-32 bg-blue-500 dark:bg-blue-900 border-r border-blue-400 dark:border-blue-800">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white">
                      {campaign.campaign_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      ₹{Math.round(campaign.spend || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      {parseInt(campaign.impressions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      {parseInt(campaign.clicks || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      ₹{Math.round(campaign.cpc || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      ₹{Math.round(campaign.cpm || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      {parseFloat(campaign.ctr || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      {(Math.round((campaign.frequency || 0) * 100) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                      {(() => {
                        const purchases = getActionValue(campaign.actions, "purchase");
                        const spend = parseSpend(campaign.spend);
                        return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                      })()}
                    </td>
                    {isMmsAccount(selectedAccount) ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "mobile_app_install").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "complete_registration").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {(() => {
                            const purchases = getActionValue(campaign.actions, "purchase");
                            const spend = parseSpend(campaign.spend);
                            return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                          })()}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "add_to_cart").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "purchase").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "initiate_checkout").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {getActionValue(campaign.actions, "complete_registration").toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black dark:text-white text-right">
                          {(() => {
                            const purchases = getActionValue(campaign.actions, "purchase");
                            const spend = parseSpend(campaign.spend);
                            return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                          })()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            )}

            {/* Aggregate/Total Row - Only show for account level */}
            {aggregateData && selectedLevel === "account" && (
              <tr className="border-t-4 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <td className="sticky left-0 z-10 px-3 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white w-32 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
                  TOTAL
                </td>
                {selectedLevel === "campaign" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white">
                    -
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  ₹{Math.round(aggregateData.spend).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  {parseInt(aggregateData.impressions).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  {parseInt(aggregateData.clicks).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  ₹{Math.round(aggregateData.cpc).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  ₹{Math.round(aggregateData.cpm).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  {parseFloat(aggregateData.ctr || 0).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  {(Math.round((aggregateData.frequency || 0) * 100) / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                  {(() => {
                    const purchases = getActionValue(aggregateData.actions, "purchase");
                    const spend = parseSpend(aggregateData.spend);
                    return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                  })()}
                </td>
                {isMmsAccount(selectedAccount) ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "mobile_app_install").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "purchase").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "complete_registration").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {(() => {
                        const purchases = getActionValue(aggregateData.actions, "purchase");
                        const spend = parseSpend(aggregateData.spend);
                        return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                      })()}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "add_to_cart").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "purchase").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "initiate_checkout").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {getActionValue(aggregateData.actions, "complete_registration").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 dark:text-white text-right">
                      {(() => {
                        const purchases = getActionValue(aggregateData.actions, "purchase");
                        const spend = parseSpend(aggregateData.spend);
                        return purchases > 0 ? `₹${Math.round(spend / purchases).toLocaleString()}` : "₹0";
                      })()}
                    </td>
                  </>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}