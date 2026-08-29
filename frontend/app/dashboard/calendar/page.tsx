"use client";
import { useState, useEffect } from "react";
import { api } from "@/src/lib/api";

export default function RenewalCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/renewals/calendar?month=8&year=2026")
      .then((res: any) => { setEvents(res.data); setLoading(false); })
      .catch((err: any) => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-center">Đang tải lịch thanh toán...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lịch Nhắc Hạn Thanh Toán 📅</h1>
      <div className="grid grid-cols-1 gap-4">
        {events.map((item, index) => (
          <div key={index} className="p-4 bg-white shadow rounded-lg flex justify-between items-center border-l-4 border-orange-500">
            <div>
              <span className="text-xs uppercase font-semibold px-2 py-1 bg-orange-100 text-orange-600 rounded">{item.serviceType}</span>
              <h3 className="font-bold text-lg mt-1">{item.serviceName}</h3>
              <p className="text-sm text-gray-500">Hạn chót: {new Date(item.expiryDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-red-600">{item.estimatedRenewalCost.toLocaleString()} đ</p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Gia hạn ngay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}