'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight, Loader, AlertCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function PublicNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?onlyPublished=true');
      if (res.ok) {
        setNews(await res.json());
      } else {
        setError('Không thể tải tin tức.');
      }
    } catch {
      setError('Không thể tải tin tức.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Tin tức & Blog</h1>
          <p className="text-slate-500 mt-2">Cập nhật mới nhất từ CloudHost VN</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {news.length === 0 ? (
              <p className="text-center text-slate-500 py-12">Chưa có bài viết nào.</p>
            ) : (
              news.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Newspaper className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase">Tin tức</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h2>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
