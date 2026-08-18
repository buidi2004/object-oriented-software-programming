'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, HelpCircle, Search, AlertCircle, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

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
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', categoryTag: 'General', displayOrder: 1 });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const fetchFaqs = async (token: string) => {
    try {
      const response = await fetch('/api/faqs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.map((item: any) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.categoryTag,
          order: item.displayOrder,
          views: 0,
          isActive: true
        })));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        await fetchFaqs(token);
        setIsLoading(false);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question.trim()) {
      alert('Vui lòng nhập câu hỏi.');
      return;
    }
    if (newFaq.answer.trim().length < 10) {
      alert('Câu trả lời phải có độ dài tối thiểu 10 ký tự.');
      return;
    }
    if (!newFaq.categoryTag.trim()) {
      alert('Vui lòng nhập danh mục cho câu hỏi.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFaq)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewFaq({ question: '', answer: '', categoryTag: 'General', displayOrder: 1 });
        await fetchFaqs(token!);
      } else {
        const errData = await response.json().catch(() => null);
        const errorMsg = errData?.errors
          ? Object.values(errData.errors).flat().join('\n')
          : (errData?.detail || errData?.title || 'Không thể tạo câu hỏi FAQ');
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
      alert('Đã có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-xl font-bold text-slate-900">Quản lý FAQ</h1>
              <p className="text-sm text-slate-500">{faqs.length} câu hỏi</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
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
            <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                        {faq.category}
                      </span>
                      <span className="text-xs text-slate-400">{faq.views} lượt xem</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${faq.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {faq.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                  {openId === faq.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>
              
              {openId === faq.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-600 mb-4">{faq.answer}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(faq.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
                      {faq.isActive ? 'Ẩn câu hỏi' : 'Hiển thị câu hỏi'}
                    </button>
                    <button disabled className="opacity-50 cursor-not-allowed px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Sửa
                    </button>
                    <button disabled className="opacity-50 cursor-not-allowed px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Không tìm thấy câu hỏi nào</p>
          </div>
        )}
      </main>

      {/* Modal Thêm FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Thêm Câu Hỏi Mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateFaq} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Câu hỏi</label>
                <input
                  type="text"
                  required
                  value={newFaq.question}
                  onChange={e => setNewFaq({...newFaq, question: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập câu hỏi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Câu trả lời <span className="text-xs text-slate-400 font-normal">(tối thiểu 10 ký tự)</span>
                </label>
                <textarea
                  required
                  minLength={10}
                  value={newFaq.answer}
                  onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Nhập câu trả lời chi tiết (tối thiểu 10 ký tự)..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <input
                    type="text"
                    required
                    value={newFaq.categoryTag}
                    onChange={e => setNewFaq({...newFaq, categoryTag: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: VPS, Hosting..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newFaq.displayOrder}
                    onChange={e => setNewFaq({...newFaq, displayOrder: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
