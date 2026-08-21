'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Testimonial {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  rating: number;
  comment: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'not-featured'>('all');

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
        fetchTestimonials();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchTestimonials = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/testimonials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'featured') return t.isFeatured;
    if (filter === 'not-featured') return !t.isFeatured;
    return true;
  });

  const featuredCount = testimonials.filter(t => t.isFeatured).length;
  const totalCount = testimonials.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await api.post('/testimonials/feature', {
        reviewId: id,
        isFeatured: !currentStatus
      });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isFeatured: !currentStatus } : t));
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      alert('Không thể thay đổi trạng thái hiển thị.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Đánh giá & Testimonials</h1>
              <p className="text-sm text-slate-500">{totalCount} đánh giá • {featuredCount} đang hiển thị</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                <p className="text-xs text-slate-500">Tổng đánh giá</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{featuredCount}</p>
                <p className="text-xs text-slate-500">Đang hiển thị</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalCount - featuredCount}</p>
                <p className="text-xs text-slate-500">Chưa hiển thị</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'featured', label: `Đang hiển thị (${featuredCount})` },
            { key: 'not-featured', label: `Chưa hiển thị (${totalCount - featuredCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonials List */}
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-slate-900 font-bold text-lg">
                    {testimonial.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{testimonial.customerName}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(testimonial.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFeatured(testimonial.id, testimonial.isFeatured)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${
                      testimonial.isFeatured
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {testimonial.isFeatured ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Đang hiển thị
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Chưa hiển thị
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-1 text-slate-600 hover:text-red-600 rounded"
                    title="Xóa đánh giá"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-amber-400 fill-current'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500 ml-2">
                  Dịch vụ: <span className="font-medium text-slate-700">{testimonial.serviceType}</span>
                </span>
              </div>

              <p className="mt-4 text-slate-600 leading-relaxed">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-medium text-slate-500">Không có đánh giá nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
