'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader, AlertCircle } from 'lucide-react';
import { api } from '@/src/lib/api';

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryTag: string;
  viewCount: number;
}

export default function KnowledgeBaseDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<KbArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/KnowledgeBase/${articleId}`);
      if (res.data) {
        setArticle(res.data);
      } else {
        setError('Không tìm thấy bài viết.');
      }
    } catch {
      setError('Không thể tải bài viết.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-slate-600">{error}</p>
        <Link href="/knowledge-base" className="mt-4 text-blue-600 font-semibold">
          Về trang thư viện
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Thư viện
        </Link>

        <article className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase">{article.categoryTag}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-6">{article.title}</h1>
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>
    </div>
  );
}
