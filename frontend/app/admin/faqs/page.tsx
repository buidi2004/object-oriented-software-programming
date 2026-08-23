'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, HelpCircle, Search, AlertCircle, 
  ChevronDown, ChevronUp, CheckCircle2, Tag, Layers, RefreshCw, X, Eye
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryTag: string;
  displayOrder: number;
}

export default function AdminFAQsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', categoryTag: 'General', displayOrder: 1 });
  const [activeFaq, setActiveFaq] = useState<FAQ | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        const isAllowed = ['Admin', 'Editor', 'Support', 'Staff'].some(
          r => r.toLowerCase() === (userData.role || '').toLowerCase()
        );
        if (!isAllowed) { router.push('/dashboard'); return; }
        await fetchFaqs(token);
        setIsLoading(false);
      } else { router.push('/login'); }
    } catch { router.push('/login'); }
  };

  const fetchFaqs = async (token?: string) => {
    const authToken = token || localStorage.getItem('accessToken');
    if (!authToken) return;

    try {
      const response = await fetch('/api/faqs', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFaqs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  // Categories list
  const categories = Array.from(new Set(faqs.map(f => f.categoryTag || 'General'))).filter(Boolean);

  // Filtered FAQs
  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.categoryTag?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.categoryTag === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // CREATE FAQ
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim()) {
      showToast('Vui lòng nhập câu hỏi.', 'error');
      return;
    }
    if (faqForm.answer.trim().length < 10) {
      showToast('Câu trả lời phải có độ dài tối thiểu 10 ký tự.', 'error');
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
        body: JSON.stringify(faqForm)
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFaqForm({ question: '', answer: '', categoryTag: 'General', displayOrder: 1 });
        await fetchFaqs();
        showToast('Thêm câu hỏi FAQ thành công!', 'success');
      } else {
        const errData = await response.json().catch(() => null);
        showToast(errData?.detail || errData?.title || 'Không thể tạo câu hỏi FAQ', 'error');
      }
    } catch {
      showToast('Đã có lỗi xảy ra khi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (faq: FAQ) => {
    setActiveFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      categoryTag: faq.categoryTag || 'General',
      displayOrder: faq.displayOrder || 1
    });
    setIsEditModalOpen(true);
  };

  // UPDATE FAQ
  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFaq) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/faqs/${activeFaq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: activeFaq.id,
          question: faqForm.question,
          answer: faqForm.answer,
          categoryTag: faqForm.categoryTag,
          displayOrder: faqForm.displayOrder
        })
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setActiveFaq(null);
        await fetchFaqs();
        showToast('Cập nhật câu hỏi FAQ thành công!', 'success');
      } else {
        const errData = await response.json().catch(() => null);
        showToast(errData?.detail || 'Không thể cập nhật câu hỏi FAQ', 'error');
      }
    } catch {
      showToast('Đã có lỗi xảy ra khi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPEN DELETE MODAL
  const openDeleteModal = (faq: FAQ) => {
    setActiveFaq(faq);
    setIsDeleteModalOpen(true);
  };

  // DELETE FAQ
  const handleDeleteFaq = async () => {
    if (!activeFaq) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/faqs/${activeFaq.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setActiveFaq(null);
        await fetchFaqs();
        showToast('Đã xóa câu hỏi FAQ thành công!', 'success');
      } else {
        showToast('Không thể xóa câu hỏi FAQ.', 'error');
      }
    } catch {
      showToast('Đã có lỗi xảy ra khi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Quản Lý Câu Hỏi FAQ</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {faqs.length} câu hỏi
                </span>
              </h1>
              <p className="text-xs text-slate-500">Đồng bộ trực tiếp với trang FAQ công khai của khách hàng</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/faqs"
              target="_blank"
              className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Trang Khách</span>
            </Link>
            <button 
              onClick={() => {
                setFaqForm({ question: '', answer: '', categoryTag: 'General', displayOrder: faqs.length + 1 });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Câu Hỏi</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo câu hỏi, câu trả lời, hoặc danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
            
            <button
              onClick={() => fetchFaqs()}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({faqs.length})
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({faqs.filter(f => f.categoryTag === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div 
              key={faq.id} 
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all overflow-hidden"
            >
              <div
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-slate-900 text-sm">{faq.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-1 border border-slate-200/60">
                        <Tag className="w-2.5 h-2.5" />
                        {faq.categoryTag || 'General'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Thứ tự: #{faq.displayOrder || 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {openId === faq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              
              {openId === faq.id && (
                <div className="px-5 pb-4.5 border-t border-slate-100 pt-3.5 bg-slate-50/40">
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 font-normal">
                    {faq.answer}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {faq.id}</span>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(faq)} 
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 
                        <span>Chỉnh Sửa</span>
                      </button>
                      <button 
                        onClick={() => openDeleteModal(faq)} 
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 
                        <span>Xóa Câu Hỏi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
            <p className="font-bold text-slate-900 text-sm">Không tìm thấy câu hỏi FAQ nào</p>
            <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc bấm Thêm Câu Hỏi.</p>
          </div>
        )}
      </main>

      {/* MODAL THÊM FAQ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Thêm Câu Hỏi FAQ Mới</span>
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFaq} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Câu hỏi FAQ *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={e => setFaqForm({...faqForm, question: e.target.value})}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="VD: Làm thế nào để kích hoạt Cloud VPS sau khi thanh toán?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Câu trả lời chi tiết * <span className="text-[11px] text-slate-500 font-normal">(tối thiểu 10 ký tự)</span>
                </label>
                <textarea
                  required
                  minLength={10}
                  value={faqForm.answer}
                  onChange={e => setFaqForm({...faqForm, answer: e.target.value})}
                  rows={5}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                  placeholder="Nhập nội dung giải đáp câu hỏi một cách chi tiết..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục (Tag)</label>
                  <input
                    type="text"
                    required
                    value={faqForm.categoryTag}
                    onChange={e => setFaqForm({...faqForm, categoryTag: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    placeholder="VD: VPS, Hosting, Billing..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={faqForm.displayOrder}
                    onChange={e => setFaqForm({...faqForm, displayOrder: parseInt(e.target.value) || 1})}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  <span>Lưu Câu Hỏi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA FAQ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Chỉnh Sửa Câu Hỏi FAQ</span>
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateFaq} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Câu hỏi FAQ *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={e => setFaqForm({...faqForm, question: e.target.value})}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Câu trả lời chi tiết * <span className="text-[11px] text-slate-500 font-normal">(tối thiểu 10 ký tự)</span>
                </label>
                <textarea
                  required
                  minLength={10}
                  value={faqForm.answer}
                  onChange={e => setFaqForm({...faqForm, answer: e.target.value})}
                  rows={5}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục (Tag)</label>
                  <input
                    type="text"
                    required
                    value={faqForm.categoryTag}
                    onChange={e => setFaqForm({...faqForm, categoryTag: e.target.value})}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={faqForm.displayOrder}
                    onChange={e => setFaqForm({...faqForm, displayOrder: parseInt(e.target.value) || 1})}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  <span>Cập Nhật Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA FAQ */}
      {isDeleteModalOpen && activeFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 p-6">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-black text-slate-900 text-center">Xóa Câu Hỏi FAQ?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa câu hỏi: <strong className="text-slate-800 font-bold">"{activeFaq.question}"</strong>?
              Hành động này không thể hoàn tác.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteFaq}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
