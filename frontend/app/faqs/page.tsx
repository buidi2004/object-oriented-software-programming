'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, 
  LifeBuoy, ArrowRight, Sparkles, AlertCircle, RefreshCw, Send, ShieldCheck
} from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  categoryTag: string;
  displayOrder: number;
}

export default function PublicFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setOpenId(data[0].id);
        }
      } else {
        setError('Không thể tải danh sách câu hỏi FAQ từ máy chủ.');
      }
    } catch {
      setError('Đã có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const tags = Array.from(new Set(faqs.map(f => f.categoryTag || 'General'))).filter(Boolean);

  const filteredFaqs = faqs.filter(faq => {
    const matchSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        faq.categoryTag?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = selectedTag === 'all' || faq.categoryTag === selectedTag;
    return matchSearch && matchTag;
  }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="min-h-screen bg-zinc-950">
      
      {/* HERO SECTION */}
      <section className="bg-zinc-950 text-white py-16 px-4 relative overflow-hidden border-b border-zinc-900">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trung Tâm Giải Đáp Thắc Mắc & Hỗ Trợ 24/7</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Tìm kiếm câu trả lời nhanh chóng về dịch vụ Cloud VPS, Hosting, Tên miền, Thanh toán và Chính sách hoàn tiền.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Nhập từ khóa cần tìm kiếm (VD: kích hoạt VPS, thanh toán, hoàn tiền...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-200 bg-zinc-800 px-2 py-1 rounded transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Category Tabs */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              Tất Cả ({faqs.length})
            </button>
            {tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {tag} ({faqs.filter(f => f.categoryTag === tag).length})
              </button>
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-bold">Đang tải danh sách câu hỏi FAQ...</p>
          </div>
        )}

        {/* Error Box */}
        {error && (
          <div className="p-4 bg-zinc-900/80 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 text-red-400 text-xs font-bold mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchFaqs}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-1 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Thử lại
            </button>
          </div>
        )}

        {/* FAQs Accordion */}
        {!isLoading && !error && (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-zinc-900/50 rounded-xl border transition-all overflow-hidden ${
                    isOpen ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/20 bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full p-4.5 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isOpen ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm sm:text-base leading-snug transition-colors ${
                          isOpen ? 'text-zinc-100' : 'text-zinc-300'
                        }`}>
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-zinc-700/50">
                            {faq.categoryTag || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 bg-zinc-800 text-zinc-300' : 'bg-zinc-800/50 text-zinc-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 bg-zinc-900/30 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredFaqs.length === 0 && (
          <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-zinc-100 text-base">Không tìm thấy câu hỏi phù hợp</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Không có câu hỏi nào khớp với từ khóa "{searchQuery}". Bạn có thể gửi yêu cầu hỗ trợ trực tiếp.
            </p>
          </div>
        )}

        {/* CONTACT / CTA CARD */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 text-center md:text-left relative z-10">
            <h3 className="text-lg sm:text-xl font-black text-zinc-100">Vẫn chưa tìm thấy câu trả lời?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Đội ngũ kỹ sư và chuyên viên CSKH của SEN CloudHost luôn sẵn sàng giải đáp 24/7/365.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/support/tickets"
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-all flex items-center gap-2"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Gửi Ticket Hỗ Trợ</span>
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold text-xs transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Liên Hệ Trực Tiếp</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
