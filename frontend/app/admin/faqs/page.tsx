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
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        setFaqs([
          { id: '1', question: 'Làm thế nào để tạo VPS?', answer: 'Hướng dẫn chi tiết...', category: 'VPS', order: 1, views: 234, isActive: true }
        ]);
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
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
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
                    <button className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Sửa
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1">
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
    </div>
  );
}
