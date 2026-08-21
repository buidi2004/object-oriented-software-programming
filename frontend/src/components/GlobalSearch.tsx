'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, Server, HelpCircle, X, ExternalLink } from 'lucide-react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  slug?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    switch (item.type) {
      case 'ServicePlan':
        router.push(`/services/${item.id}`);
        break;
      case 'News':
        router.push(item.slug ? `/blog/${item.slug}` : `/blog/${item.id}`);
        break;
      case 'Article':
        router.push(`/knowledge-base/${item.id}`);
        break;
      case 'Faq':
        router.push(`/faqs`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ServicePlan': return <Server className="w-5 h-5 text-blue-500" />;
      case 'News': return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'Article': return <HelpCircle className="w-5 h-5 text-purple-500" />;
      case 'Faq': return <HelpCircle className="w-5 h-5 text-amber-500" />;
      default: return <Search className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Tìm kiếm"
        title="Tìm kiếm (Ctrl+K)"
      >
        <Search className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-6">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm dịch vụ, bài viết, FAQ..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder:text-slate-400"
              />
              {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin ml-2 shrink-0" />}
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  <p className="text-sm">Gõ từ khóa để bắt đầu tìm kiếm</p>
                </div>
              ) : results.length === 0 && !isLoading ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  <p className="text-sm">Không tìm thấy kết quả nào cho &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-4 py-3 flex items-start gap-4 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white border border-slate-100">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                      </div>
                      <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↑</kbd> <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↓</kbd> để chọn</span>
              <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Enter</kbd> để mở</span>
              <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Esc</kbd> để đóng</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
