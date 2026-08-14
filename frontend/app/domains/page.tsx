'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, ShieldCheck, Settings, Clock, AlertCircle, Plus } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  expiryDate: string;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'pending';
  nameservers: string[];
}

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDomains(token);
  }, [router]);

  const fetchDomains = async (token: string) => {
    try {
      const response = await fetch('/api/domains/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900">
              CloudHost<span className="text-blue-600"> VN</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Tên Miền Của Tôi</h1>
            <p className="text-slate-500 mt-1">Tổng cộng {domains.length} tên miền đang quản lý</p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Đăng ký tên miền mới
          </Link>
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có tên miền nào</h2>
            <p className="text-slate-500 mb-6">Hãy đăng ký tên miền thương hiệu của bạn ngay hôm nay!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Tra cứu tên miền
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{domain.name}</h3>
                      <p className="text-xs text-slate-500">
                        {domain.status === 'active' ? 'Đang hoạt động' : 
                         domain.status === 'expired' ? 'Đã hết hạn' : 'Chờ xác thực'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    domain.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    domain.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {domain.status === 'active' ? 'Hoạt động' : 
                     domain.status === 'expired' ? 'Hết hạn' : 'Chờ'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Hết hạn
                    </span>
                    <span className="font-semibold text-slate-900">
                      {new Date(domain.expiryDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Tự động gia hạn
                    </span>
                    <span className={`font-semibold ${domain.autoRenew ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {domain.autoRenew ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/domains/${domain.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Quản lý DNS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
