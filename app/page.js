"use client";
import { useEffect, useState } from "react";

const presets = [
  "today",
  "yesterday",
  "this_month",
  "last_month",
  "this_quarter",
  "maximum",
  "data_maximum",
  "last_3d",
  "last_7d",
  "last_14d",
  "last_28d",
  "last_30d",
  "last_90d",
  "last_week_mon_sun",
  "last_week_sun_sat",
  "last_quarter",
  "last_year",
  "this_week_mon_today",
  "this_week_sun_today",
  "this_year",
];

export default function Home() {
  const [mode, setMode] = useState("preset");
  const [presetDate, setPresetDate] = useState("yesterday");
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");

  const [overview, setOverview] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculateCustomOverview = (campaigns) => {
    if (!campaigns.length) return null;

    const totalSpend = campaigns.reduce(
      (sum, c) => sum + parseFloat(c.spend || 0),
      0
    );
    const totalImpressions = campaigns.reduce(
      (sum, c) => sum + parseInt(c.impressions || 0),
      0
    );
    const totalClicks = campaigns.reduce(
      (sum, c) => sum + parseInt(c.clicks || 0),
      0
    );
    const totalReach = campaigns.reduce(
      (sum, c) => sum + parseInt(c.reach || 0),
      0
    );

    const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const averageCPM =
      totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const averageCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const frequency = totalReach > 0 ? totalImpressions / totalReach : 0;

    return {
      total_spend: totalSpend,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      total_reach: totalReach,
      average_cpc: averageCPC,
      average_cpm: averageCPM,
      average_ctr: averageCTR,
      frequency: frequency,
    };
  };

  const fetchPresetData = async () => {
    setLoading(true);
    const res = await fetch(`/api/dashboard?date_preset=${presetDate}`);
    const json = await res.json();
    console.log(json);
    setOverview(json?.data?.overview || null);
    setTableData(json?.data?.campaigns || []);
    setLoading(false);
  };

  const fetchCustomData = async () => {
    setLoading(true);
    const res = await fetch(`/api/custom?start=${startDate}&end=${endDate}`);
    const json = await res.json();
    const data = json?.data || [];

    setTableData(data);
    setOverview(calculateCustomOverview(data));
    setLoading(false);
  };

  const loadData = () => {
    if (mode === "preset") {
      fetchPresetData();
    } else {
      fetchCustomData();
    }
  };

  useEffect(() => {
    loadData();
  }, [presetDate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Facebook Ads Dashboard</h1>

      {/* Toggle Mode */}
      <div className="flex gap-4 mb-6 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("preset");
              setTableData([]);
              setOverview(null);
            }}
            className={`px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition ${
              mode === "preset" ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            Use Preset Date
          </button>
          <button
            onClick={() => {
              setMode("custom");
              setTableData([]);
              setOverview(null);
            }}
            className={`px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition ${
              mode === "custom" ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            Use Custom Date Range
          </button>
        </div>
        <buttom
          className="px-4 py-2 bg-blue-600 rounded text-white cursor-pointer hover:bg-blue-600 transition"
          onClick={() => (window.location.href = "/graphs")}
        >
          Graphs 📈
        </buttom>
      </div>

      {/* Preset Selector */}
      {mode === "preset" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Date Preset
          </label>
          <select
            value={presetDate}
            onChange={(e) => setPresetDate(e.target.value)}
            className="p-2 rounded border w-full"
          >
            {presets.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Date Range Picker */}
      {mode === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={loadData}
              className="px-6 py-2 bg-blue-600 text-white rounded mt-4"
            >
              Fetch Data
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Overview if preset */}
          {overview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(overview).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-white p-4 rounded shadow text-center"
                >
                  <h2 className="text-sm text-gray-500 uppercase">
                    {key.replace(/_/g, " ")}
                  </h2>
                  <p className="text-lg font-semibold">
                    {key == "average_ctr" || key == "frequency"
                      ? Math.round(val * 100) / 100
                      : Math.round(val)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Campaign Performance</h2>
            <div className="overflow-auto">
              <table className="w-full table-auto border border-gray-200 text-center">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Campaign</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Spend</th>
                    <th className="px-4 py-2">Impressions</th>
                    <th className="px-4 py-2">Clicks</th>
                    <th className="px-4 py-2">Reach</th>
                    <th className="px-4 py-2">CPC</th>
                    <th className="px-4 py-2">CPM</th>
                    <th className="px-4 py-2">CTR</th>
                    <th className="px-4 py-2">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, idx) => (
                    <tr key={idx} className="border-t text-sm text-gray-700">
                      <td className="px-4 py-2">
                        {item.campaign_name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {item.date_start !== item.date_stop
                          ? `${item.date_start} → ${item.date_stop}`
                          : item.date_start || item.date}
                      </td>
                      <td className="px-4 py-2">{Math.round(item.spend)}</td>
                      <td className="px-4 py-2">{item.impressions}</td>
                      <td className="px-4 py-2">{item.clicks}</td>
                      <td className="px-4 py-2">{item.reach}</td>
                      <td className="px-4 py-2">{Math.round(item.cpc)}</td>
                      <td className="px-4 py-2">{Math.round(item.cpm)}</td>
                      <td className="px-4 py-2">
                        {Math.round(item.ctr * 100) / 100}
                      </td>
                      <td className="px-4 py-2">
                        {Math.round(item.frequency * 100) / 100}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
