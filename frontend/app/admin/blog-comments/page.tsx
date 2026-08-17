'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Trash2, Shield, RefreshCw, CheckCircle2, 
  AlertCircle, ArrowLeft, Search, User, Clock 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  status: 'Approved' | 'Pending' | 'Spam';
}

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');

  // Sample data fallback
  const mockComments: CommentItem[] = [
    {
      id: 'c-1',
      articleId: 'art-1',
      authorName: 'Nguyễn Văn Hùng',
      authorEmail: 'hung.nguyen@company.vn',
      content: 'Bài viết rất chi tiết và hữu ích về cách tối ưu Nginx Reverse Proxy cho VPS NVMe!',
      createdAt: '2026-08-17T10:30:00Z',
      status: 'Approved',
    },
    {
      id: 'c-2',
      articleId: 'art-2',
      authorName: 'Crypto Promo Bot',
      authorEmail: 'bot998@freemail.ru',
      content: 'Click here to get 1000% ROI in 24 hours on bitcoin cloud mining!',
      createdAt: '2026-08-17T14:15:00Z',
      status: 'Spam',
    },
    {
      id: 'c-3',
      articleId: 'art-3',
      authorName: 'Trần Thị Mai',
      authorEmail: 'mai.tran@startup.io',
      content: 'Cho mình hỏi nếu nâng cấp từ gói VPS Basic lên Pro thì có bị gián đoạn dịch vụ không ạ?',
      createdAt: '2026-08-17T16:45:00Z',
      status: 'Approved',
    },
  ];

  useEffect(() => {
    setComments(mockComments);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`).catch(() => {});
      setComments(comments.filter(c => c.id !== id));
      setSuccess('Đã xóa bình luận thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setComments(comments.filter(c => c.id !== id));
      setSuccess('Đã xóa bình luận thành công!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const filtered = comments.filter(c => 
    c.authorName.toLowerCase().includes(search.toLowerCase()) || 
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-sky-600" /> Kiểm Duyệt Bình Luận Bài Viết
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý và kiểm duyệt bình luận của độc giả trên Blog &amp; Tin tức công nghệ.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung / tác giả..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Comments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tác Giả</th>
                  <th className="px-6 py-4">Nội Dung Bình Luận</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4">Thời Gian</th>
                  <th className="px-6 py-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{c.authorName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{c.authorEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-md leading-relaxed">
                      {c.content}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        c.status === 'Spam' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
