'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, HelpCircle, Search, AlertCircle, 
  ChevronDown, ChevronUp, X, Loader2 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  views: number;
  isActive: boolean;
}

export default function AdminFAQsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    categoryTag: 'General',
    displayOrder: 1
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      await fetchFaqs();
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get('/faqs');
      if (res.data) {
        setFaqs(res.data.map((item: any) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.categoryTag || 'General',
          order: item.displayOrder || 1,
          views: 0,
          isActive: true
        })));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      categoryTag: 'General',
      displayOrder: faqs.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FAQ, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      categoryTag: faq.category,
      displayOrder: faq.order
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Vui lòng nhập đầy đủ câu hỏi và câu trả lời.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, {
          id: editingFaq.id,
          question: formData.question,
          answer: formData.answer,
          categoryTag: formData.categoryTag,
          displayOrder: Number(formData.displayOrder)
        });
      } else {
        await api.post('/faqs', {
          question: formData.question,
          answer: formData.answer,
          categoryTag: formData.categoryTag,
          displayOrder: Number(formData.displayOrder)
        });
      }

      setIsModalOpen(false);
      await fetchFaqs();
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu câu hỏi FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi FAQ này?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error('Error deleting FAQ', err);
      alert(err.response?.data?.message || 'Không thể xóa câu hỏi FAQ');
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Câu hỏi FAQ</h1>
              <p className="text-sm text-slate-500">{faqs.length} câu hỏi</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                        {faq.category}
                      </span>
                      <span className="text-xs text-slate-400">Thứ tự: {faq.order}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {openId === faq.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>
              
              {openId === faq.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                  <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{faq.answer}</p>
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => handleOpenEditModal(faq, e)}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                    <button 
                      onClick={(e) => handleDelete(faq.id, e)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mt-4">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có câu hỏi FAQ nào</p>
          </div>
        )}
      </main>

      {/* Modal Add/Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingFaq ? 'Chỉnh Sửa Câu Hỏi FAQ' : 'Thêm Câu Hỏi FAQ Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Câu hỏi (Question) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Làm sao để cài đặt SSL miễn phí?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục *</label>
                  <select
                    value={formData.categoryTag}
                    onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="General">Chung (General)</option>
                    <option value="VPS">Cloud VPS</option>
                    <option value="Hosting">Web Hosting</option>
                    <option value="Domain">Tên miền & DNS</option>
                    <option value="Billing">Thanh toán & Hóa đơn</option>
                    <option value="Technical">Kỹ thuật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Câu trả lời (Answer) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Nhập câu trả lời chi tiết..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingFaq ? 'Lưu thay đổi' : 'Tạo FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
