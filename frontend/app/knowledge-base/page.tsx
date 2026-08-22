'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '@/src/lib/api';
import { Header } from '@/src/components/Header';

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  categoryTag: string;
  viewCount: number;
}

export default function PublicKnowledgeBasePage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/KnowledgeBase')
      .then((res) => setArticles(res.data))
      .catch(() => setError('Không thể tải bài viết.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Trung tâm trợ giúp</h1>
        <p className="text-slate-600 mb-8">Hướng dẫn và tài liệu kỹ thuật</p>

        {isLoading && <Loader className="w-8 h-8 text-[#1F1F1F] animate-spin mx-auto" />}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge-base/${article.id}`}
              className="block bg-white rounded border border-slate-200 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[#1F1F1F]" />
                    <span className="text-xs font-bold text-[#1F1F1F] uppercase">{article.categoryTag}</span>
                  </div>
                  <h2 className="font-bold text-slate-900 group-hover:text-[#1F1F1F]">{article.title}</h2>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#1F1F1F] shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && articles.length === 0 && !error && (
          <p className="text-center text-slate-600 py-12">Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
}
