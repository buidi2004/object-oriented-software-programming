import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, Server, Globe, Database } from 'lucide-react';
import { api } from '../lib/api';
import Link from 'next/link';
import { useAuthStore } from '../store/useAuthStore';

interface ViewedService {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  viewedAt: string;
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<ViewedService[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    }
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      // In a real app, there would be an endpoint to GET recently viewed
      // For demo, we mock it. The RecordView command exists in backend.
      // const res = await api.get('/recently-viewed');
      // setItems(res.data);
      
      setItems([
        { id: '1', serviceId: 'vps-pro', serviceName: 'VPS Pro (4C/8G)', category: 'VPS', viewedAt: new Date().toISOString() },
        { id: '2', serviceId: 'hosting-biz', serviceName: 'Hosting Business', category: 'Hosting', viewedAt: new Date(Date.now() - 3600000).toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to fetch recently viewed', error);
    }
  };

  if (!user || items.length === 0) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'VPS': return <Server className="w-5 h-5 text-blue-600" />;
      case 'Hosting': return <Database className="w-5 h-5 text-indigo-600" />;
      case 'Domain': return <Globe className="w-5 h-5 text-emerald-600" />;
      default: return <Server className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Dịch vụ đã xem gần đây
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link href={`/services/${item.serviceId}`} key={item.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-blue-100 transition-colors">
              {getIcon(item.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {item.serviceName}
              </h4>
              <p className="text-xs text-slate-500">
                Xem {new Date(item.viewedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
