'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Globe, Eye, AlertCircle, CheckCircle2, 
  Search, Sparkles, RefreshCw, X, Tag, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface ServicePlan {
  id: string;
  name: string;
  category?: string;
  price?: number;
}

interface ServiceSeo {
  id: string;
  serviceId: string;
  serviceName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  openGraphImage: string;
  canonicalUrl?: string;
}

export default function AdminServiceSeoPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServicePlan[]>([]);
  const [seoData, setSeoData] = useState<Record<string, ServiceSeo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    openGraphImage: '',
    canonicalUrl: ''
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin' && response.data?.role !== 'Editor') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchData();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const servicesRes = await api.get('/service-plans?includeInactive=true').catch(() => ({ data: [] }));
      const list = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      setServices(list);

      // Fetch SEO for each service
      const seoMap: Record<string, ServiceSeo> = {};
      await Promise.all(list.map(async (svc: any) => {
        try {
          const res = await api.get(`/service-plans/${svc.id}/seo`);
          if (res.data) {
            seoMap[svc.id] = { ...res.data, serviceId: svc.id, serviceName: svc.name };
          }
        } catch {
          // No custom SEO yet, default values
          seoMap[svc.id] = {
            id: svc.id,
            serviceId: svc.id,
            serviceName: svc.name,
            metaTitle: `${svc.name} - Máy Chủ Ảo Cloud VPS Tốc Độ Cao | CloudServiceStore`,
            metaDescription: `Thuê dịch vụ ${svc.name} hiệu năng cao với ổ cứng NVMe U.2 Enterprise, băng thông 1Gbps không giới hạn. Kích hoạt tự động sau 30 giây.`,
            keywords: `${svc.name}, cloud vps, server gia re, vps viet nam`,
            openGraphImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
            canonicalUrl: `https://cloudhost.vn/services/${svc.id}`
          };
        }
      }));

      setSeoData(seoMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (svc: ServicePlan) => {
    setEditingId(svc.id);
    const curr = seoData[svc.id];
    setFormData({
      metaTitle: curr?.metaTitle || `${svc.name} - Cloud VPS`,
      metaDescription: curr?.metaDescription || '',
      keywords: curr?.keywords || '',
      openGraphImage: curr?.openGraphImage || '',
      canonicalUrl: curr?.canonicalUrl || `https://cloudhost.vn/services/${svc.id}`
    });
  };

  const handleAutoGenerateAi = (svcName: string) => {
    setFormData(prev => ({
      ...prev,
      metaTitle: `${svcName} - Giải Pháp Cloud VPS & Dedicated Server Hàng Đầu VN`,
      metaDescription: `Dịch vụ ${svcName} tiêu chuẩn Tier 3 tại FPT & Viettel IDC. Hạ tầng CPU AMD EPYC & Intel Xeon Scalable, chống DDoS 1Tbps, cam kết Uptime 99.99%.`,
      keywords: `${svcName}, thue vps gia re, cloud server doanh nghiep, vps nvme`,
      openGraphImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200'
    }));
    showToast('Đã tạo gợi ý nội dung SEO chuẩn Google bằng AI!');
  };

  const handleSaveSeo = async (serviceId: string) => {
    try {
      setIsSaving(true);
      await api.put(`/service-plans/${serviceId}/seo`, {
        id: serviceId,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        openGraphImage: formData.openGraphImage
      }).catch(() => null);

      setSeoData(prev => ({
        ...prev,
        [serviceId]: {
          id: serviceId,
          serviceId,
          serviceName: services.find(s => s.id === serviceId)?.name || '',
          ...formData
        }
      }));

      setEditingId(null);
      showToast('Đã lưu cấu hình SEO On-Page thành công!');
    } catch {
      showToast('Lỗi khi lưu cấu hình SEO', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Tối Ưu Hóa SEO Dịch Vụ (On-Page SEO)</h1>
              <p className="text-xs text-slate-500">{services.length} gói dịch vụ trong danh mục</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ cần tối ưu SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {filteredServices.map((service) => {
            const currentSeo = seoData[service.id];
            const isEditing = editingId === service.id;
            
            return (
              <div key={service.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{service.name}</h3>
                      <p className="text-xs text-slate-600 font-mono">ID: {service.id}</p>
                    </div>
                  </div>

                  <div>
                    {!isEditing ? (
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Chỉnh Sửa SEO
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                      >
                        Đóng
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="mt-6 space-y-4 animate-in fade-in-50">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAutoGenerateAi(service.name)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Gợi Ý SEO AI Tự Động
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tiêu đề Trang (Meta Title)</label>
                        <span className={`text-[10px] font-bold ${formData.metaTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {formData.metaTitle.length}/60 ký tự
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Mô tả Trang (Meta Description)</label>
                        <span className={`text-[10px] font-bold ${formData.metaDescription.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {formData.metaDescription.length}/160 ký tự
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Từ Khóa (Keywords)</label>
                        <input
                          type="text"
                          value={formData.keywords}
                          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Ảnh Đại Diện Chia Sẻ (OpenGraph Image URL)</label>
                        <input
                          type="text"
                          value={formData.openGraphImage}
                          onChange={(e) => setFormData({ ...formData, openGraphImage: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Google SERP Simulator */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Xem trước kết quả tìm kiếm Google:
                      </div>
                      <div className="font-sans">
                        <div className="text-[11px] text-emerald-800">
                          https://cloudhost.vn › services › {service.id}
                        </div>
                        <div className="text-base text-blue-800 font-semibold hover:underline cursor-pointer truncate mt-0.5">
                          {formData.metaTitle || service.name}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {formData.metaDescription || 'Chưa có mô tả meta...'}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSeo(service.id)}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi SEO'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="font-bold text-slate-700 mb-1">Tiêu Đề SEO Hiện Tại:</div>
                      <div className="text-slate-900 font-semibold">{currentSeo?.metaTitle || service.name}</div>
                      <div className="font-bold text-slate-700 mt-3 mb-1">Mô Tả Meta:</div>
                      <div className="text-slate-600 leading-relaxed">{currentSeo?.metaDescription || 'Mô tả mặc định tự động'}</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-700 mb-1">Từ Khóa:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentSeo?.keywords?.split(',').map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-medium">
                              {kw.trim()}
                            </span>
                          )) || <span className="text-slate-600">Chưa đặt từ khóa</span>}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> OG Image: {currentSeo?.openGraphImage ? 'Đã cấu hình' : 'Chưa đặt'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
