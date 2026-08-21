"use client";
import { useState, useEffect } from "react";
import api from "@/src/lib/api";

const CATEGORY_ICON: Record<string, string> = {
  Tools: "🛠️",
  Manuals: "📘",
  Drivers: "💾",
  Templates: "📄",
};

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function ResourcesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");

  useEffect(() => {
    api.get("/api/resources")
      .then((res) => { setItems(Array.isArray(res.data) ? res.data : res.data.items ?? res.data.result ?? []); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];
  const visible = filter === "Tất cả" ? items : items.filter((i) => i.category === filter);

  if (loading) return <div className="p-6 text-center">Đang tải thư viện tài nguyên...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thư Viện Tài Nguyên & Mẫu Cấu Hình 📚</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm border ${filter === c ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 hover:border-blue-400"}`}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 && <p className="text-gray-500">Chưa có tài nguyên nào.</p>}

      <div className="grid grid-cols-1 gap-4">
        {visible.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{CATEGORY_ICON[item.category] ?? "📁"}</span>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">{item.category} • {formatSize(item.fileSize)}</p>
              </div>
            </div>
            <a href={item.fileUrl} download
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Tải về
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
