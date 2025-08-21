"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { StockData } from "@/lib/alphaVantage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Mock data
const MOCK_STOCKS: StockData[] = [
  {
    date: "2025-08-21",
    open: 242.11,
    high: 242.88,
    low: 240.34,
    close: 242.55,
    volume: 3240064,
  },
  {
    date: "2025-08-20",
    open: 241.5,
    high: 243.0,
    low: 240.0,
    close: 241.8,
    volume: 3000000,
  },
  {
    date: "2025-08-19",
    open: 240.2,
    high: 241.5,
    low: 239.0,
    close: 240.5,
    volume: 2800000,
  },
];

export default function StockTable() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<keyof StockData>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/stocks?symbol=IBM")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setStocks(MOCK_STOCKS);
        } else {
          setStocks(data.slice(0, 10));
        }
      })
      .catch((err) => {
        setError(err.message);
        setStocks(MOCK_STOCKS);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (key: keyof StockData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Chart
  const chartData = {
    labels: sortedStocks.map((s) => s.date).reverse(),
    datasets: [
      {
        label: "Close Price",
        data: sortedStocks.map((s) => s.close).reverse(),
        fill: false,
        backgroundColor: "rgba(34,197,94,0.6)",
        borderColor: "rgba(34,197,94,1)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions: import("chart.js").ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Price ($)",
        },
      },
    },
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Stock Data</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border border-gray-200">
          <thead className="">
            {error && (
              <tr>
                <td colSpan={6} className="p-2 text-center text-red-600">
                  Error: {error} <br />
                  Using mock data
                </td>
              </tr>
            )}
            <tr>
              {["date", "open", "high", "low", "close", "volume"].map((key) => (
                <th
                  key={key}
                  className="p-2 border cursor-pointer select-none"
                  onClick={() => handleSort(key as keyof StockData)}
                >
                  {key.toUpperCase()}
                  {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-2 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              sortedStocks.map((s) => (
                <tr key={s.date} className="">
                  <td className="p-2 border text-center">{s.date}</td>
                  <td className="p-2 border text-center">
                    {s.open.toFixed(2)}
                  </td>
                  <td className="p-2 border text-center">
                    {s.high.toFixed(2)}
                  </td>
                  <td className="p-2 border text-center">{s.low.toFixed(2)}</td>
                  <td className="p-2 border text-center">
                    {s.close.toFixed(2)}
                  </td>
                  <td className="p-2 border text-center">
                    {s.volume.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 rounded shadow-md">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
