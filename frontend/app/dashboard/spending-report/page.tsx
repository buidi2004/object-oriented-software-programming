"use client";
import { useState, useEffect } from "react";
import api from "@/src/lib/api";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function SpendingReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/spending-reports/monthly?month=${month}&year=${year}`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [month, year]);

  if (loading) return <div className="p-6 text-center">Đang tải báo cáo chi tiêu...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Báo Cáo Chi Tiêu Tháng 📊</h1>

      <div className="flex gap-2 mb-6">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border rounded p-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded p-2">
          {[2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-center text-gray-500 mb-2">Tổng chi tiêu tháng {month}/{year}</p>
        <p className="text-center text-3xl font-bold text-blue-600 mb-6">
          {data.totalAmount.toLocaleString()} đ
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie data={data.breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={120} label>
              {data.breakdown.map((entry: any, index: number) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} đ`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
