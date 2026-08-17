'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

export interface NewsArticleItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  categoryTag?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
}

const FALLBACK_ARTICLES: NewsArticleItem[] = [
  {
    id: 'n-1',
    title: 'Hướng Dẫn Tối Ưu Nginx & PHP-FPM Đạt 10,000 CCU Trên VPS NVMe',
    slug: 'huong-dan-toi-uu-nginx-php-fpm-vps-nvme',
    summary: 'Tổng hợp các tinh chỉnh cấu hình worker_processes, keepalive_timeout và fastcgi cache giúp website chịu tải khủng.',
    categoryTag: 'Kiến Thức Kỹ Thuật',
    createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'n-2',
    title: 'Ra Mắt Cụm Máy Chủ AMD EPYC 9654 Gen 4 Tại Datacenter Hà Nội',
    slug: 'ra-mat-cum-may-chu-amd-epyc-9654-ha-noi',
    summary: 'Nâng cấp toàn diện năng lực tính toán với 96 Cores / 192 Threads và RAM DDR5 4800MHz phục vụ các tác vụ AI & Big Data.',
    categoryTag: 'Thông Cáo Hệ Thống',
    createdAt: '2026-08-12T10:30:00Z',
  },
  {
    id: 'n-3',
    title: 'So Sánh Cloud VPS Và Dedicated Server: Doanh Nghiệp Nên Chọn Gì?',
    slug: 'so-sanh-cloud-vps-va-dedicated-server',
    summary: 'Phân tích chi tiết bài toán chi phí TCO, khả năng mở rộng linh hoạt và mức độ kiểm soát phần cứng cho doanh nghiệp.',
    categoryTag: 'Tư Vấn Giải Pháp',
    createdAt: '2026-08-10T14:00:00Z',
  },
];

export const HomeLatestNews: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticleItem[]>(FALLBACK_ARTICLES);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get<NewsArticleItem[]>('/news?onlyPublished=true');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data.slice(0, 3));
      }
    } catch {
      // Keep fallbacks
    }
  };

  return (
    <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Blog &amp; Kiến Thức Công Nghệ
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tin Tức &amp; <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Cập Nhật Mới Nhất</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Khám phá các hướng dẫn kỹ thuật, xu hướng hạ tầng đám mây và thông báo nâng cấp hệ thống định kỳ.
            </p>
          </div>

          <Link
            href="/news"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800 group shrink-0"
          >
            <span>Xem tất cả bài viết</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/blog/${art.slug}`}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                    {art.categoryTag || 'Tin Tức'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(art.publishedAt || art.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3 line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                  {art.summary || 'Tìm hiểu chi tiết các bước cài đặt và cấu hình tối ưu hiệu năng cho hệ thống của bạn.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Đọc bài viết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
