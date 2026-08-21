'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Search, Package, 
  CheckCircle, XCircle, Upload, Save, AlertCircle, Eye, Image as ImageIcon, 
  Server, DollarSign, Calendar, Filter, Database, Gamepad2, Layers, Globe, 
  HardDrive, Shield, RefreshCw, Sparkles, Check, CheckCircle2, ChevronRight,
  TrendingUp, Tag, Cpu, SlidersHorizontal, ArrowUpDown, HelpCircle
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface ServicePlan {
  servicePlanId: string;
  servicePlanName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cpu: string;
  ram: string;
  ssd: string;
  bandwidth: string;
  imageUrl: string;
  isActive: boolean;
}

interface PlanPrice {
  id: string;
  billingCycle: number;
  price: number;
  currency: string;
  effectiveFrom: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Category Icon & Color Mapping
const getCategoryIcon = (name: string, slug?: string) => {
  const n = (name + ' ' + (slug || '')).toLowerCase();
  if (n.includes('vps')) return <Server className="w-4 h-4 text-blue-500" />;
  if (n.includes('dedicated')) return <Server className="w-4 h-4 text-purple-500" />;
  if (n.includes('database')) return <Database className="w-4 h-4 text-emerald-500" />;
  if (n.includes('game')) return <Gamepad2 className="w-4 h-4 text-rose-500" />;
  if (n.includes('app') || n.includes('1click')) return <Layers className="w-4 h-4 text-amber-500" />;
  if (n.includes('static')) return <Globe className="w-4 h-4 text-cyan-500" />;
  if (n.includes('storage') || n.includes('s3')) return <HardDrive className="w-4 h-4 text-indigo-500" />;
  if (n.includes('ssl')) return <Shield className="w-4 h-4 text-teal-500" />;
  if (n.includes('miền') || n.includes('domain')) return <Globe className="w-4 h-4 text-blue-600" />;
  if (n.includes('bảo mật') || n.includes('security') || n.includes('waf')) return <Shield className="w-4 h-4 text-red-500" />;
  if (n.includes('chuyển') || n.includes('migration')) return <RefreshCw className="w-4 h-4 text-orange-500" />;
  return <Package className="w-4 h-4 text-slate-500" />;
};

function AdminServicePlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoryFilter = searchParams.get('category') || 'all';

  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'price_asc' | 'price_desc'>('name_asc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pricing Modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentPrices, setCurrentPrices] = useState<PlanPrice[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  
  // Pricing Form state
  const [priceFormCycle, setPriceFormCycle] = useState<number>(1);
  const [priceFormAmount, setPriceFormAmount] = useState<string>('');
  const [priceFormId, setPriceFormId] = useState<string | null>(null);

  // Form state for Plan Specs
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formCpu, setFormCpu] = useState('');
  const [formRam, setFormRam] = useState('');
  const [formSsd, setFormSsd] = useState('');
  const [formBandwidth, setFormBandwidth] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data.role !== 'Admin' && res.data.role !== 'Editor') {
        router.push('/dashboard');
        return;
      }
      await Promise.all([fetchPlans(), fetchCategories()]);
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/service-plans/admin');
      setPlans(res.data || []);
    } catch {
      showToast('Lỗi khi tải danh sách sản phẩm');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = (presetCategory?: string) => {
    setEditingPlan(null);
    setFormName('');
    const targetCatId = presetCategory 
      ? categories.find(c => c.slug === presetCategory || c.name === presetCategory)?.id 
      : (categories[0]?.id || '');
    setFormCategoryId(targetCatId || categories[0]?.id || '');
    setFormCpu('');
    setFormRam('');
    setFormSsd('');
    setFormBandwidth('');
    setFormIsActive(true);
    setSelectedFile(null);
    setPreviewImage('');
    setShowModal(true);
  };

  const openEditModal = (plan: ServicePlan) => {
    setEditingPlan(plan);
    setFormName(plan.servicePlanName || '');
    setFormCategoryId(plan.categoryId || categories[0]?.id || '');
    setFormCpu(plan.cpu || '');
    setFormRam(plan.ram || '');
    setFormSsd(plan.ssd || '');
    setFormBandwidth(plan.bandwidth || '');
    setFormIsActive(plan.isActive !== false);
    setSelectedFile(null);
    setPreviewImage(plan.imageUrl || '');
    setShowModal(true);
  };

  const openPricingModal = async (plan: ServicePlan) => {
    setEditingPlan(plan);
    setShowPricingModal(true);
    setIsPricingLoading(true);
    resetPricingForm();
    await fetchPrices(plan.servicePlanId);
  };

  const fetchPrices = async (planId: string) => {
    try {
      const res = await api.get(`/service-plans/${planId}/prices`);
      setCurrentPrices(res.data || []);
    } catch {
      showToast('Lỗi tải danh sách giá');
    } finally {
      setIsPricingLoading(false);
    }
  };

  const resetPricingForm = () => {
    setPriceFormId(null);
    setPriceFormCycle(1);
    setPriceFormAmount('');
  };

  const handleEditPrice = (price: PlanPrice) => {
    setPriceFormId(price.id);
    setPriceFormCycle(price.billingCycle);
    setPriceFormAmount(price.price.toString());
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    setIsSaving(true);
    try {
      const payload = {
        servicePlanId: editingPlan.servicePlanId,
        billingCycle: priceFormCycle,
        price: parseFloat(priceFormAmount),
        currency: 'VND',
        effectiveFrom: new Date().toISOString()
      };

      if (priceFormId) {
        await api.put(`/service-plans/${editingPlan.servicePlanId}/prices/${priceFormId}`, { ...payload, id: priceFormId });
        showToast('Cập nhật mức giá thành công!');
      } else {
        await api.post(`/service-plans/${editingPlan.servicePlanId}/prices`, payload);
        showToast('Thêm mức giá mới thành công!');
      }
      
      resetPricingForm();
      await fetchPrices(editingPlan.servicePlanId);
      fetchPlans();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi lưu giá');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!editingPlan || !confirm('Xác nhận xóa mức giá này?')) return;
    try {
      await api.delete(`/service-plans/${editingPlan.servicePlanId}/prices/${priceId}`);
      showToast('Đã xóa mức giá');
      await fetchPrices(editingPlan.servicePlanId);
      fetchPlans();
    } catch {
      showToast('Lỗi khi xóa giá');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let planId = editingPlan?.servicePlanId;

      if (!planId) {
        // Create
        const res = await api.post('/service-plans', {
          categoryId: formCategoryId,
          name: formName,
          cpu: formCpu,
          ram: formRam,
          ssd: formSsd,
          bandwidth: formBandwidth,
          isActive: formIsActive
        });
        planId = res.data.id;
        showToast(`Thêm sản phẩm "${formName}" thành công!`);
      } else {
        // Update
        await api.put(`/service-plans/${planId}`, {
          id: planId,
          name: formName,
          cpu: formCpu,
          ram: formRam,
          ssd: formSsd,
          bandwidth: formBandwidth
        });
        showToast(`Cập nhật thông tin "${formName}" thành công!`);
      }

      // Upload image if selected
      if (selectedFile && planId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/service-plans/${planId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Đã cập nhật hình ảnh sản phẩm!');
      }

      setShowModal(false);
      fetchPlans();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA / Ẩn sản phẩm "${name}"?`)) return;
    
    try {
      await api.delete(`/service-plans/${id}`);
      showToast(`Đã xóa sản phẩm "${name}"`);
      fetchPlans();
    } catch {
      showToast('Lỗi khi xóa sản phẩm');
    }
  };

  // Filtered and Sorted Plans
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      // Search
      const matchSearch = searchTerm === '' || 
        p.servicePlanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ssd?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      let matchCat = true;
      if (selectedCategory !== 'all') {
        const matchedCategoryObj = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase());
        if (matchedCategoryObj) {
          matchCat = p.categoryId === matchedCategoryObj.id || p.categoryName === matchedCategoryObj.name;
        } else {
          matchCat = p.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase());
        }
      }

      // Status filter
      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.isActive !== false;
      if (statusFilter === 'inactive') matchStatus = p.isActive === false;

      return matchSearch && matchCat && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return (a.servicePlanName || '').localeCompare(b.servicePlanName || '');
    });
  }, [plans, categories, searchTerm, selectedCategory, statusFilter, sortBy]);

  // Plan counts per category
  const categoryPlanCounts = useMemo(() => {
    const counts: Record<string, number> = { all: plans.length };
    plans.forEach(p => {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
      if (p.categoryName) {
        counts[p.categoryName] = (counts[p.categoryName] || 0) + 1;
      }
    });
    return counts;
  }, [plans]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Quản lý Bảng Giá & Gói Dịch Vụ
                </h1>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
                  {plans.length} Sản phẩm
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tùy chỉnh giá bán, thông số CPU / RAM / NVMe, và chu kỳ thanh toán cho 11+ danh mục dịch vụ Cloud.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAddModal(selectedCategory !== 'all' ? selectedCategory : undefined)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Thêm Gói Sản Phẩm
            </button>
          </div>
        </div>

        {/* 11+ Category Filter Pills Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Tất cả dịch vụ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {plans.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = categoryPlanCounts[cat.id] || categoryPlanCounts[cat.name] || 0;
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id || selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  {getCategoryIcon(cat.name, cat.slug)}
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên gói, CPU, RAM, SSD..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs w-full font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">🟢 Đang bán</option>
                <option value="inactive">🔴 Đã ẩn</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name_asc">Tên (A - Z)</option>
              <option value="price_asc">Giá (Thấp đến Cao)</option>
              <option value="price_desc">Giá (Cao đến Thấp)</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4 w-16 text-center">Ảnh</th>
                  <th className="p-4">Tên Sản Phẩm / Dịch Vụ</th>
                  <th className="p-4">Danh Mục</th>
                  <th className="p-4">Giá Bán Cơ Bản</th>
                  <th className="p-4 hidden md:table-cell">Thông Số Kỹ Thuật (Hardware Specs)</th>
                  <th className="p-4 text-center w-24">Trạng Thái</th>
                  <th className="p-4 text-right w-36">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.servicePlanId} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 text-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center mx-auto shadow-2xs">
                          {plan.imageUrl ? (
                            <img src={'http://localhost:5053' + plan.imageUrl} alt={plan.servicePlanName} className="w-full h-full object-cover" />
                          ) : (
                            getCategoryIcon(plan.categoryName)
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {plan.servicePlanName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5" title={plan.servicePlanId}>
                          ID: {plan.servicePlanId.split('-')[0]}...
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {getCategoryIcon(plan.categoryName)}
                          <span>{plan.categoryName || 'Chưa phân loại'}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-emerald-600 text-sm">
                          {plan.price ? plan.price.toLocaleString('vi-VN') + ' đ' : 'Chưa có giá'}
                        </div>
                        <button
                          onClick={() => openPricingModal(plan)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline mt-0.5 block"
                        >
                          Quản lý đa chu kỳ &gt;
                        </button>
                      </td>
                      <td className="p-4 text-slate-600 hidden md:table-cell text-xs">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {plan.cpu && (
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                              CPU: {plan.cpu}
                            </span>
                          )}
                          {plan.ram && (
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                              RAM: {plan.ram}
                            </span>
                          )}
                          {plan.ssd && (
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                              SSD: {plan.ssd}
                            </span>
                          )}
                          {plan.bandwidth && (
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                              BW: {plan.bandwidth}
                            </span>
                          )}
                          {!plan.cpu && !plan.ram && !plan.ssd && (
                            <span className="text-slate-400 italic text-[11px]">Dịch vụ không dùng thông số CPU/RAM</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {plan.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Đã ẩn
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPricingModal(plan)}
                            className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                            title="Chỉnh sửa bảng giá"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sửa Giá</span>
                          </button>
                          <button
                            onClick={() => openEditModal(plan)}
                            className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors font-bold text-xs"
                            title="Sửa thông số gói"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.servicePlanId, plan.servicePlanName)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                            title="Xóa / Ẩn sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">Không tìm thấy sản phẩm phù hợp</p>
                      <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc danh mục hoặc từ khóa tìm kiếm</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT & SPECS */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">
                  {editingPlan ? `Sửa thông tin: ${editingPlan.servicePlanName}` : 'Thêm Gói Sản Phẩm Mới'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Tên Gói Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                    placeholder="VD: Dedicated AMD EPYC 7502, Cloud VPS Pro..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Danh Mục Dịch Vụ *</label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-xs font-medium"
                  >
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hardware Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  Thông số phần cứng / Cấu hình (Tùy chọn)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">CPU / vCPU</label>
                    <input
                      type="text"
                      list="cpu-suggestions"
                      value={formCpu}
                      onChange={e => setFormCpu(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-xs"
                      placeholder="VD: 16 Core / 32 Thread"
                    />
                    <datalist id="cpu-suggestions">
                      <option value="1 Core" />
                      <option value="2 Cores" />
                      <option value="4 Cores" />
                      <option value="8 Cores" />
                      <option value="16 Core / 32 Thread" />
                      <option value="28 Core / 56 Thread" />
                      <option value="32 Core / 64 Thread" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">RAM / Bộ nhớ</label>
                    <input
                      type="text"
                      list="ram-suggestions"
                      value={formRam}
                      onChange={e => setFormRam(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-xs"
                      placeholder="VD: 64GB ECC DDR4"
                    />
                    <datalist id="ram-suggestions">
                      <option value="1GB" />
                      <option value="2GB" />
                      <option value="4GB" />
                      <option value="8GB" />
                      <option value="16GB" />
                      <option value="32GB" />
                      <option value="64GB" />
                      <option value="128GB" />
                      <option value="256GB" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">SSD / Ổ cứng lưu trữ</label>
                    <input
                      type="text"
                      list="ssd-suggestions"
                      value={formSsd}
                      onChange={e => setFormSsd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-xs"
                      placeholder="VD: 2x 1TB NVMe RAID 1"
                    />
                    <datalist id="ssd-suggestions">
                      <option value="20GB SSD" />
                      <option value="40GB NVMe" />
                      <option value="80GB NVMe" />
                      <option value="150GB NVMe" />
                      <option value="250GB NVMe" />
                      <option value="500GB NVMe" />
                      <option value="2x 500GB SSD" />
                      <option value="2x 1TB NVMe" />
                      <option value="4x 2TB NVMe" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Băng thông / Đường truyền</label>
                    <input
                      type="text"
                      list="bw-suggestions"
                      value={formBandwidth}
                      onChange={e => setFormBandwidth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-xs"
                      placeholder="VD: 1Gbps / 20TB hoặc Unlimited"
                    />
                    <datalist id="bw-suggestions">
                      <option value="Unlimited" />
                      <option value="1Gbps / 10TB" />
                      <option value="1Gbps / 20TB" />
                      <option value="10Gbps / Unmetered" />
                      <option value="Anti-DDoS Game" />
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Ảnh đại diện sản phẩm (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <img src={previewImage.startsWith('blob:') ? previewImage : `http://localhost:5053${previewImage}`} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP tối đa 2MB</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Thông Tin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRICING MANAGER (Monthly, Yearly, Multi-Cycle) */}
      {showPricingModal && editingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Quản lý Bảng Giá: {editingPlan.servicePlanName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Danh mục: <strong className="text-slate-700">{editingPlan.categoryName}</strong> • Thiết lập các mức giá chu kỳ thanh toán
                </p>
              </div>
              <button 
                onClick={() => setShowPricingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6 text-xs">
              {/* Form Add / Edit Price */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  {priceFormId ? 'Cập nhật mức giá đã chọn' : 'Thêm Mức Giá Chu Kỳ Mới'}
                </h3>
                <form onSubmit={handleSavePrice} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chu kỳ thanh toán</label>
                    <select
                      value={priceFormCycle}
                      onChange={(e) => setPriceFormCycle(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                    >
                      <option value={1}>1 Tháng (Monthly)</option>
                      <option value={3}>3 Tháng (Quarterly)</option>
                      <option value={6}>6 Tháng (Semi-Annually)</option>
                      <option value={2}>1 Năm (Yearly)</option>
                      <option value={24}>2 Năm (Biennially)</option>
                      <option value={36}>3 Năm (Triennially)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giá tiền (VNĐ) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={priceFormAmount}
                        onChange={(e) => setPriceFormAmount(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700 pr-12"
                        placeholder="VD: 2800000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">VNĐ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : (priceFormId ? 'Cập nhật' : 'Thêm Mức Giá')}</span>
                    </button>
                    {priceFormId && (
                      <button
                        type="button"
                        onClick={resetPricingForm}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Prices Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Các mức giá đang áp dụng</h4>
                  <span className="text-[11px] text-slate-500">{currentPrices.length} chu kỳ</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Chu kỳ</th>
                      <th className="p-3.5">Giá bán</th>
                      <th className="p-3.5">Ngày kích hoạt</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isPricingLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
                    ) : currentPrices.length > 0 ? (
                      currentPrices.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-800">
                            {p.billingCycle === 1 ? '1 Tháng' : 
                             p.billingCycle === 2 ? '1 Năm' : 
                             p.billingCycle === 3 ? '3 Tháng' :
                             p.billingCycle === 6 ? '6 Tháng' :
                             `${p.billingCycle} Tháng`}
                          </td>
                          <td className="p-3.5 font-extrabold text-emerald-600 text-sm">
                            {p.price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(p.effectiveFrom).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditPrice(p)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Sửa giá này"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePrice(p.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa giá này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          Chưa có cấu hình giá nào cho sản phẩm này. Hãy thêm mức giá phía trên!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminServicePlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminServicePlansContent />
    </Suspense>
  );
}
