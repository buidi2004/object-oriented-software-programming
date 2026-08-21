'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import { DownloadCloud, FileText, Search, File, FileArchive, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  category: string;
  createdAt: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data);
    } catch (error) {
      console.error('Failed to fetch resources', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category))).filter(Boolean)];

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-rose-500" />;
    if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) return <FileArchive className="w-8 h-8 text-amber-500" />;
    if (['exe', 'msi', 'sh'].includes(ext || '')) return <Settings className="w-8 h-8 text-slate-500" />;
    return <File className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 flex items-center justify-center gap-3">
            <DownloadCloud className="w-10 h-10 text-emerald-600" />
            Tài nguyên &amp; Tải xuống
          </h1>
          <p className="text-lg text-slate-500">
            Tải về các tài liệu hướng dẫn, phần mềm công cụ hỗ trợ và driver cần thiết.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm tài nguyên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl h-40 border border-slate-100"></div>
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {getFileIcon(resource.fileUrl)}
                  </div>
                  <div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 mb-1">
                      {resource.category || 'Khác'}
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="text-xs text-slate-600">
                    {formatFileSize(resource.fileSize)} • Cập nhật {formatDistanceToNow(new Date(resource.createdAt), { locale: vi })}
                  </div>
                  <a
                    href={`http://localhost:5053${resource.fileUrl}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    <DownloadCloud className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <File className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy tài nguyên nào</h3>
            <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        )}

      </div>
    </div>
  );
}
