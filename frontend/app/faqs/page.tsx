'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Loader, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setFaqs)
      .catch(() => setError('Không thể tải FAQ.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Câu hỏi thường gặp</h1>
        <p className="text-slate-500 mb-8">Giải đáp nhanh các thắc mắc phổ biến</p>

        {isLoading && <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50"
              >
                <span className="font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  {faq.question}
                </span>
                {openId === faq.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        {!isLoading && faqs.length === 0 && !error && (
          <p className="text-center text-slate-500 py-12">Chưa có câu hỏi nào.</p>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
