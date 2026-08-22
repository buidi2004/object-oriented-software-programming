'use client';

import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Clock, Send, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export const BlogComments: React.FC<{ articleId?: string; postSlug?: string }> = ({ articleId, postSlug }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchComments = () => {
    if (!articleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/articles/${articleId}/comments`)
      .then(res => setComments(Array.isArray(res.data) ? res.data.filter((c: any) => c.isApproved !== false) : []))
      .catch(err => console.error("Error fetching comments:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [articleId, postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !articleId) return;

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await api.post('/comments', {
        articleId,
        content: newComment
      });
      setNewComment('');
      setSuccessMsg('Bình luận của bạn đã được gửi và đang chờ Admin duyệt.');
      fetchComments();
    } catch (err: any) {
      console.error("Error posting comment:", err);
      alert(err.response?.data?.message || 'Vui lòng đăng nhập để gửi bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1F1F1F]">
          <MessageCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Bình luận ({comments.length})
        </h2>
      </div>

      <div className="space-y-6 mb-8">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-[#1F1F1F] animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                {(comment.author || 'User').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{comment.author || 'Người dùng'}</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
