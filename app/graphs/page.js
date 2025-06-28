// app/graphs/page.jsx (or pages/graphs.js for Pages Router)

"use client";
import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

export default function GraphsPage() {
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/custom?start=${startDate}&end=${endDate}`
      );
      const campaigns = res.data.data || [];

      // Construct chart data
      const dates = campaigns.map((c) => c.date_start);
      const spends = campaigns.map((c) => parseFloat(c.spend));

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "Spend",
            data: spends,
            fill: false,
            borderColor: "#3b82f6",
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 mb-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          📈 Campaign Spend Trends
        </h1>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              className="p-2 border rounded w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              className="p-2 border rounded w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={fetchGraphData}
          className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Show Chart
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {chartData && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
}
