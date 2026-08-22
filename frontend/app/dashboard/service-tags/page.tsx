"use client";
import { useState, useEffect } from "react";
import { api } from "@/src/lib/api";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];

export default function ServiceTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const load = () => {
    api.get("/api/service-tags")
      .then((res: any) => { setTags(res.data); setLoading(false); })
      .catch((err: any) => { console.error(err); setLoading(false); });
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    await api.put(`/api/service-tags/${editing.serviceId}`, { tagColor: color, note });
    setEditing(null);
    load();
  };

  if (loading) return <div className="p-6 text-center">Đang tải tag dịch vụ...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tag Màu & Ghi Chú Dịch Vụ 🏷️</h1>
      <div className="grid grid-cols-1 gap-4">
        {tags.map((item) => (
          <div key={item.serviceId} className="p-4 bg-white shadow rounded-lg flex justify-between items-center border-l-4" style={{ borderLeftColor: item.tagColor }}>
            <div>
              <span className="text-xs uppercase font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">{item.serviceType}</span>
              <h3 className="font-bold text-lg mt-1">{item.serviceName}</h3>
              {item.note ? <p className="text-sm text-gray-500">📝 {item.note}</p> : <p className="text-sm text-gray-400 italic">Chưa có ghi chú</p>}
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={() => { setEditing(item); setNote(item.note ?? ""); setColor(item.tagColor); }}
            >
              Chỉnh sửa
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Gắn tag cho {editing.serviceName}</h2>
            <div className="flex gap-2 mb-4">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-gray-900" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú riêng..." className="w-full border rounded p-2 mb-4" rows={3} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Hủy</button>
              <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
