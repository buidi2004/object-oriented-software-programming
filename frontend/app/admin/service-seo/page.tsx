'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Globe, Eye, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface ServicePlan {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

interface ServiceSeo {
  id: string;
  serviceId: string;
  serviceName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  openGraphImage: string;
}

export default function AdminServiceSeoPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServicePlan[]>([]);
  const [seoData, setSeoData] = useState<Record<string, ServiceSeo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  
  // Form state
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formOpenGraphImage, setFormOpenGraphImage] = useState('');

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
        if (userData.role !== 'Admin' && userData.role !== 'Editor') { router.push('/dashboard'); return; }
        fetchData(token);
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchData = async (token: string) => {
    try {
      // Fetch services
      const servicesRes = await fetch('/api/service-plans?currency=VND', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        const mappedServices: ServicePlan[] = data.map((item: any) => ({
          id: item.servicePlanId,
          name: item.servicePlanName,
          category: 'service',
          price: item.price,
          isActive: true
        }));
        setServices(mappedServices);
        
        // Fetch SEO for each service
        const seoPromises = mappedServices.map(async (svc) => {
          const seoRes = await fetch(`/api/service-plans/${svc.id}/seo`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (seoRes.ok) {
            const seo = await seoRes.json();
            return [svc.id, { ...seo, serviceId: svc.id, serviceName: svc.name }];
          }
          return [svc.id, null as any];
        });
        
        const seoResults = await Promise.all(seoPromises);
        const seoMap: Record<string, ServiceSeo> = {};
        seoResults.forEach(([id, seo]: any) => {
          if (seo) seoMap[id] = seo;
        });
        setSeoData(seoMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEdit = (service: ServicePlan) => {
    setEditingId(service.id);
    const currentSeo = seoData[service.id];
    setFormMetaTitle(currentSeo?.metaTitle || service.name);
    setFormMetaDescription(currentSeo?.metaDescription || '');
    setFormKeywords(currentSeo?.keywords || '');
    setFormOpenGraphImage(currentSeo?.openGraphImage || '');
  };

  const handleClose = () => {
    setEditingId(null);
  };

  const handleSave = async (serviceId: string) => {
    setSaveStatus(prev => ({ ...prev, [serviceId]: 'saving' }));
    const token = localStorage.getItem('accessToken');
    
    try {
      await fetch(`/api/service-plans/${serviceId}/seo`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          id: serviceId,
          metaTitle: formMetaTitle,
          metaDescription: formMetaDescription,
          keywords: formKeywords,
          openGraphImage: formOpenGraphImage
        })
      });
      
      setSeoData(prev => ({
        ...prev,
        [serviceId]: {
          id: serviceId,
          serviceId,
          serviceName: services.find(s => s.id === serviceId)?.name || '',
          metaTitle: formMetaTitle,
          metaDescription: formMetaDescription,
          keywords: formKeywords,
          openGraphImage: formOpenGraphImage
        }
      }));
      setSaveStatus(prev => ({ ...prev, [serviceId]: 'saved' }));
      setTimeout(() => {
        setSaveStatus(prev => {
          const next = { ...prev };
          delete next[serviceId];
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to save SEO:', error);
      setSaveStatus(prev => ({ ...prev, [serviceId]: 'error' }));
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý SEO Dịch vụ</h1>
              <p className="text-sm text-slate-500">{services.length} dịch vụ</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const currentSeo = seoData[service.id];
            const isEditing = editingId === service.id;
            const status = saveStatus[service.id];
            
            return (
              <div key={service.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900">{service.name}</h3>
                      {currentSeo?.metaTitle && (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Đã cấu hình SEO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {currentSeo?.metaTitle || 'Chưa có Meta Title'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-lg truncate">
                      {currentSeo?.metaDescription || 'Chưa có Meta Description'}
                    </p>
                  </div>
                  
                  {!isEditing && (
                    <button 
                      onClick={() => openEdit(service)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Chỉnh sửa SEO
                    </button>
                  )}
                </div>

                {/* Expanded Edit Form */}
                {isEditing && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Meta Title <span className="text-slate-400">({formMetaTitle.length}/60)</span>
                        </label>
                        <input 
                          type="text"
                          value={formMetaTitle}
                          onChange={(e) => setFormMetaTitle(e.target.value)}
                          maxLength={60}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Keywords <span className="text-slate-400">(phân cách bởi dấu phẩy)</span>
                        </label>
                        <input 
                          type="text"
                          value={formKeywords}
                          onChange={(e) => setFormKeywords(e.target.value)}
                          placeholder="vps, hosting, cloud..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Meta Description <span className="text-slate-400">({formMetaDescription.length}/160)</span>
                        </label>
                        <textarea
                          value={formMetaDescription}
                          onChange={(e) => setFormMetaDescription(e.target.value)}
                          maxLength={160}
                          rows={3}
                          placeholder="Mô tả ngắn gọn cho công cụ tìm kiếm..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Open Graph Image URL
                        </label>
                        <input 
                          type="url"
                          value={formOpenGraphImage}
                          onChange={(e) => setFormOpenGraphImage(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-2">Xem trước Google SERP:</p>
                      <div className="max-w-2xl">
                        <p className="text-blue-600 text-lg font-medium truncate">
                          {formMetaTitle || 'Tiêu đề sẽ hiển thị ở đây'}
                        </p>
                        <p className="text-green-700 text-sm">
                          cloudstore.vn › services › {service.name.toLowerCase()}
                        </p>
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                          {formMetaDescription || 'Mô tả sẽ hiển thị ở đây...'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button 
                        onClick={() => handleSave(service.id)}
                        disabled={status === 'saving'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {status === 'saving' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lưu...
                          </>
                        ) : status === 'saved' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Đã lưu!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleClose}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Không tìm thấy dịch vụ nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
