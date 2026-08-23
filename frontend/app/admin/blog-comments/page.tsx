'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, Trash2, Shield, RefreshCw, CheckCircle2, 
  AlertCircle, ArrowLeft, Search, User, Clock, Check, Star
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function AdminBlogCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin' && response.data?.role !== 'Editor') {
        router.push('/dashboard');
        return;
      }
      fetchComments();
    } catch {
      router.push('/login');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/comments');
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/comments/${id}/approve`);
      setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: true } : c));
      setSuccess('Đã duyệt bình luận thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể duyệt bình luận.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
      setSuccess('Đã xóa bình luận thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Xóa bình luận thất bại.');
    }
  };

  const filteredComments = comments.filter(c => 
    (c.authorName && c.authorName.toLowerCase().includes(search.toLowerCase())) ||
    (c.content && c.content.toLowerCase().includes(search.toLowerCase())) ||
    (c.authorEmail && c.authorEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quản lý Bình luận Tin tức &amp; Đánh Giá</h1>
                <p className="text-xs text-slate-600">{comments.length} bình luận bài viết trên hệ thống</p>
              </div>
            </div>
            <button 
              onClick={fetchComments}
              className="px-4 py-2 rounded-sm bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <Link
              href="/admin/reviews"
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200/80"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Đánh Giá Sản Phẩm &amp; Dịch Vụ</span>
            </Link>
            <Link
              href="/admin/blog-comments"
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white text-white" />
              <span>2. Bình Luận Bài Viết &amp; Tin Tức Blog ({comments.length})</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {success && (
          <div className="mb-4 p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {success}
          </div>
        )}

        <div className="bg-white rounded p-4 border border-slate-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo người đăng, email, nội dung bình luận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-600" />
                        {comment.authorName || 'Ẩn danh'}
                      </span>
                      {comment.authorEmail && (
                        <span className="text-xs text-slate-600 font-mono">
                          ({comment.authorEmail})
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${comment.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {comment.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/80 p-3 rounded border border-slate-100">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Duyệt bình luận"
                      >
                        <Check className="w-4 h-4" />
                        Duyệt
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                      title="Xóa bình luận"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredComments.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">Chưa có bình luận nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
