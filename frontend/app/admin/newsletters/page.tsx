'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Plus, Edit2, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  clickCount: number;
}

export default function AdminNewslettersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnsubscribe, setShowUnsubscribe] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchSubscribers();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchSubscribers = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // Note: Current API only has Subscribe and Unsubscribe (public)
      // This is a mock for demonstration
      setTimeout(() => {
        setSubscribers([
          {
            id: '1',
            email: 'john.doe@example.com',
            subscribedAt: '2024-01-15T10:00:00Z',
            isActive: true,
            clickCount: 12
          },
          {
            id: '2',
            email: 'jane.smith@example.com',
            subscribedAt: '2024-01-20T14:30:00Z',
            isActive: false,
            clickCount: 3
          }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      setIsLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    // Mock toggle - would need a backend endpoint for this
    setSubscribers(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa subscriber này?')) return;
    
    const token = localStorage.getItem('accessToken');
    // Mock delete - would need a backend endpoint for this
    setSubscribers(prev => prev.filter(s => s.id !== id));
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Newsletter</h1>
              <p className="text-sm text-slate-500">{subscribers.length} người đăng ký</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Gửi email
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{subscribers.filter(s => s.isActive).length}</p>
                <p className="text-xs text-slate-500">Đang aktif</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{subscribers.filter(s => !s.isActive).length}</p>
                <p className="text-xs text-slate-500">Đã hủy đăng ký</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {subscribers.reduce((sum, s) => sum + s.clickCount, 0)}
                </p>
                <p className="text-xs text-slate-500">Tổng lượt click</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày đăng ký</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lượt click</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{subscriber.email}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(subscriber.subscribedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {subscriber.clickCount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      subscriber.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {subscriber.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {subscriber.isActive ? 'Aktif' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleStatus(subscriber.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(subscriber.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Không tìm thấy người đăng ký nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
