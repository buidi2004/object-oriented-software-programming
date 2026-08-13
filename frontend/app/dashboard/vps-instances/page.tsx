'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Server, Activity, ArrowRight, Play, Square, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VpsInstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/vpsinstances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstances(data);
      }
    } catch (error) {
      console.error('Error fetching VPS instances', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Quản lý VPS</h1>
            <p className="text-slate-500 mt-1">Danh sách máy chủ đám mây của bạn</p>
          </div>
          <Link href="/services/cloud-vps" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
            <Server className="w-5 h-5" /> Mua thêm VPS
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : instances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có VPS nào</h3>
            <p className="text-slate-500 mb-6">Hãy khởi tạo máy chủ đám mây đầu tiên của bạn để bắt đầu.</p>
            <Link href="/services/cloud-vps" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
              Khám phá ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((vps) => (
              <div key={vps.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{vps.containerName || 'VPS Instance'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${vps.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {vps.status === 1 ? 'Running' : 'Stopped'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{vps.containerId?.substring(0,12) || 'Pending...'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Server className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Hết hạn</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(vps.expiresAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(vps.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="Start">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors" title="Stop">
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <Link 
                    href={`/dashboard/vps-instances/${vps.id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Chi tiết <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
