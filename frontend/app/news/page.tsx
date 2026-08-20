'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight, Loader, AlertCircle, Eye, Tag, Image as ImageIcon } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnailUrl?: string;
  tags?: string;
  viewCount?: number;
  publishedAt?: string;
  content?: string;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-slate-500 gap-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Tin tức & Blog</span>
        </div>

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
          <div className="space-y-12">
            {news.length === 0 ? (
              <p className="text-center text-slate-500 py-12">Chưa có bài viết nào.</p>
            ) : (
              <>
                {/* Featured Post (First item) */}
                {news.length > 0 && (
                  <Link href={`/blog/${news[0].slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-slate-100">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Image Left */}
                      <div className="md:w-3/5 relative overflow-hidden bg-slate-100">
                        {news[0].thumbnailUrl ? (
                          <img
                            src={news[0].thumbnailUrl}
                            alt={news[0].title}
                            className="w-full h-[220px] sm:h-[300px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-[220px] sm:h-[300px] md:h-[400px] flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-16 h-16" />
                          </div>
                        )}
                      </div>
                      {/* Content Right */}
                      <div className="md:w-2/5 p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
                        {news[0].publishedAt && (
                          <span className="text-xs sm:text-sm text-slate-500 font-medium mb-2 sm:mb-3 block">
                            {new Date(news[0].publishedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3 sm:mb-4">
                          {news[0].title}
                        </h2>
                        {news[0].content && (
                          <p className="text-sm sm:text-base text-slate-600 line-clamp-3 sm:line-clamp-4 leading-relaxed mb-4 sm:mb-8">
                            {news[0].content.replace(/<[^>]*>/g, '').replace(/[#*`_~>\-\[\]]/g, '').trim()}
                          </p>
                        )}
                        <div className="mt-auto flex items-center text-xs sm:text-sm font-bold text-red-600 uppercase tracking-wider">
                          XEM THÊM <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Rest of the posts Grid */}
                {news.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                    {news.slice(1).map((item) => (
                      <Link
                        key={item.id}
                        href={`/blog/${item.slug}`}
                        className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col border border-slate-100 shadow-2xs"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-10 h-10" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 flex flex-col flex-1">
                          {item.publishedAt && (
                            <span className="text-[11px] sm:text-xs text-slate-500 font-medium mb-1.5 sm:mb-2 block">
                              {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-3 flex-1 leading-snug">
                            {item.title}
                          </h2>
                          {item.content && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 line-clamp-2 leading-relaxed">
                              {item.content.replace(/<[^>]*>/g, '').replace(/[#*`_~>\-\[\]]/g, '').trim().slice(0, 150)}…
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
