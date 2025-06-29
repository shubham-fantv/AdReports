"use client";
import React, { useState, useEffect } from "react";
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
import { subDays, format, parseISO } from "date-fns";

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

  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchDefaultChart();
  }, []);

  const fetchDefaultChart = async () => {
    setLoading(true);

    const end = new Date();
    const start = subDays(end, 27);
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    try {
      const res = await axios.get(
        `/api/custom?start=${startStr}&end=${endStr}`
      );
      const campaigns = res.data.data || [];

      // Map spends per date
      const dailySpendMap = {};
      campaigns.forEach((item) => {
        const date = item.date_start;
        if (!dailySpendMap[date]) {
          dailySpendMap[date] = 0;
        }
        dailySpendMap[date] += parseFloat(item.spend || 0);
      });

      // Split into 4 weeks
      const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const weeks = [[], [], [], []];
      let i = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = format(d, "yyyy-MM-dd");
        const dayLabel = dayMap[d.getDay()];
        const weekIndex = Math.floor(i / 7);
        weeks[weekIndex].push({
          day: dayLabel,
          spend: dailySpendMap[iso] || 0,
        });
        i++;
      }

      // Construct chart datasets
      const datasets = weeks.map((week, idx) => ({
        label: weekLabels[idx],
        data: week.map((d) => d.spend),
        borderColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][idx],
        fill: false,
        tension: 0.4,
      }));

      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      setChartData({
        labels,
        datasets,
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    }

    setLoading(false);
  };

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
