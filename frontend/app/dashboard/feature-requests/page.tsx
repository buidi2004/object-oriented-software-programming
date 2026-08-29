"use client";
import { useState, useEffect } from "react";
import { api } from "@/src/lib/api";

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xem xét",
  Planned: "Đã lên kế hoạch",
  InProgress: "Đang làm",
  Completed: "Hoàn thành",
};
const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Planned: "bg-blue-100 text-blue-600",
  InProgress: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-600",
};

export default function FeatureRequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = () => {
    api.get("/feature-requests")
      .then((res: any) => { setItems(res.data); setLoading(false); })
      .catch((err: any) => { console.error(err); setLoading(false); });
  };

  useEffect(load, []);

  const vote = async (id: string) => {
    await api.post(`/feature-requests/${id}/vote`);
    load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/feature-requests", { title, description });
    setTitle(""); setDescription("");
    load();
  };

  if (loading) return <div className="p-6 text-center">Đang tải đề xuất tính năng...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Đề Xuất Tính Năng & Bỏ Phiếu 🗳️</h1>

      <form onSubmit={submit} className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Đề xuất tính năng mới</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề đề xuất"
          className="w-full border rounded p-2 mb-2" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết..."
          className="w-full border rounded p-2 mb-2" rows={2} />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Gửi đề xuất</button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-4 flex gap-4 items-center">
            <button onClick={() => vote(item.id)}
              className={`flex flex-col items-center px-3 py-2 rounded border min-w-[64px] ${item.hasVoted ? "bg-orange-50 border-orange-400 text-orange-600" : "border-gray-300 hover:border-orange-400"}`}>
              <span>▲</span>
              <span className="font-bold">{item.upvotes}</span>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${STATUS_COLOR[item.status] ?? "bg-gray-100"}`}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-xs text-gray-400 mt-1">bởi {item.authorName} • {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
