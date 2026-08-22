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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-slate-600 gap-2 pb-4 border-b border-slate-100">
          <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-900">Tin công nghệ</span>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-12">
            {news.length === 0 ? (
              <p className="text-center text-slate-600 py-12">Chưa có bài viết nào.</p>
            ) : (
              <>
                {/* Featured Post (First item) */}
                {news.length > 0 && (
                  <div className="group flex flex-col md:flex-row items-stretch bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all duration-300">
                    {/* Image Left */}
                    <Link href={`/blog/${news[0].slug}`} className="md:w-[55%] relative overflow-hidden bg-slate-100 block">
                      {news[0].thumbnailUrl ? (
                        <img
                          src={news[0].thumbnailUrl}
                          alt={news[0].title}
                          className="w-full h-full min-h-[300px] object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-[300px] md:h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-16 h-16" />
                        </div>
                      )}
                    </Link>
                    {/* Content Right */}
                    <div className="md:w-[45%] p-6 md:p-10 flex flex-col justify-center">
                      {news[0].publishedAt && (
                        <span className="text-sm text-slate-600 mb-3 block">
                          {new Date(news[0].publishedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      <Link href={`/blog/${news[0].slug}`}>
                        <h2 className="text-2xl md:text-3xl lg:text-[28px] font-bold text-slate-800 hover:text-red-600 transition-colors uppercase leading-tight mb-4">
                          {news[0].title}
                        </h2>
                      </Link>
                      {news[0].content && (
                        <p className="text-base text-slate-600 line-clamp-3 md:line-clamp-4 leading-relaxed mb-8">
                          {news[0].content.replace(/<[^>]*>/g, '').replace(/[#*`_~>\-\[\]]/g, '').trim()}
                        </p>
                      )}
                      <Link 
                        href={`/blog/${news[0].slug}`}
                        className="mt-auto inline-flex items-center text-sm font-semibold text-red-600 uppercase tracking-wider hover:text-red-700"
                      >
                        XEM THÊM <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Rest of the posts Grid */}
                {news.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.slice(1).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white group flex flex-col"
                      >
                        {/* Thumbnail */}
                        <Link href={`/blog/${item.slug}`} className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative block mb-4">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <ImageIcon className="w-10 h-10" />
                            </div>
                          )}
                        </Link>

                        {/* Content */}
                        <div className="flex flex-col flex-1">
                          {item.publishedAt && (
                            <span className="text-xs text-slate-600 mb-2 block">
                              {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          <Link href={`/blog/${item.slug}`}>
                            <h2 className="text-lg font-bold text-slate-800 hover:text-red-600 transition-colors uppercase leading-snug line-clamp-3">
                              {item.title}
                            </h2>
                          </Link>
                        </div>
                      </div>
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
