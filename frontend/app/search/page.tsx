'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Server, ShoppingCart, User, Globe, Shield } from 'lucide-react';
import { api } from '@/src/lib/api';

interface SearchResult {
  type: 'service' | 'order' | 'user' | 'domain' | 'vps' | 'article';
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
}

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    const fetchSearch = async () => {
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        if (response.data && Array.isArray(response.data)) {
          const mappedResults: SearchResult[] = response.data.map((item: any) => ({
            type: item.type === 'Article' ? 'article' : item.type === 'ServicePlan' ? 'service' : 'vps',
            title: item.title,
            description: item.description,
            url: item.url || (item.type === 'Article' ? `/news/${item.id}` : `/services/${item.id}`),
            icon: item.type === 'Article' ? <FileText className="w-4 h-4" /> : <Server className="w-4 h-4" />
          }));
          setResults(mappedResults);
        } else {
          setResults([]);
        }
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    }
    if (e.key === 'Enter' && results.length > 0) {
      window.location.href = results[0].url;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div ref={searchRef} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Tìm kiếm dịch vụ, đơn hàng, người dùng..."
              className="w-full pl-12 pr-12 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setShowResults(false); setError(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick hints */}
          {!query && (
            <div className="flex flex-wrap gap-2 mt-3">
              {['VPS', 'Hosting', 'Domain', 'SSL', 'Đơn hàng'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-sm text-sm text-slate-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {isSearching ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Đang tìm kiếm...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="font-medium text-red-600">{error}</p>
            <button
              onClick={() => { setQuery(query); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : showResults ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              Tìm thấy {results.length} kết quả cho "{query}"
            </p>
            {results.length > 0 ? (
              results.map((result, idx) => (
                <a
                  key={idx}
                  href={result.url}
                  onClick={() => setShowResults(false)}
                  className="block bg-white rounded border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-[#1F1F1F] transition-colors shrink-0">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-[#1F1F1F] transition-colors">
                        {result.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{result.description}</p>
                      <p className="text-xs text-slate-600 mt-2">{result.url}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-700 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded border border-slate-200">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p className="font-medium text-slate-600">Không tìm thấy kết quả nào</p>
                <p className="text-sm text-slate-600 mt-1">Thử với từ khóa khác</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Empty state when no query */}
      {!query && !showResults && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-800" />
            <p className="text-slate-600 text-lg font-medium">Tìm kiếm nhanh</p>
            <p className="text-slate-600 text-sm mt-2">Nhập từ khóa để tìm kiếm</p>
          </div>
        </div>
      )}
    </div>
  );
}
