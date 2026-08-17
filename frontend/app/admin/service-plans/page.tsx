'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Search, Package, 
  CheckCircle, XCircle, Upload, Save, AlertCircle, Eye, Image as ImageIcon, Server, DollarSign, Calendar
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
}

export default function AdminServicePlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formCpu, setFormCpu] = useState('');
  const [formRam, setFormRam] = useState('');
  const [formSsd, setFormSsd] = useState('');
  const [formBandwidth, setFormBandwidth] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data.role !== 'Admin' && res.data.role !== 'Editor') {
        router.push('/dashboard');
        return;
      }
      await Promise.all([fetchPlans(), fetchCategories()]);
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/service-plans/admin');
      setPlans(res.data);
    } catch (error) {
      alert('Lỗi khi tải danh sách sản phẩm');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
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
    setFormIsActive(plan.isActive !== false); // default to true if undefined
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
      setCurrentPrices(res.data);
    } catch (error) {
      alert('Lỗi tải danh sách giá');
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
        alert('Cập nhật giá thành công');
      } else {
        await api.post(`/service-plans/${editingPlan.servicePlanId}/prices`, payload);
        alert('Thêm mức giá thành công');
      }
      
      resetPricingForm();
      await fetchPrices(editingPlan.servicePlanId);
      fetchPlans(); // refresh main list to update starting price if needed
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi lưu giá');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!editingPlan || !confirm('Xóa mức giá này?')) return;
    try {
      await api.delete(`/service-plans/${editingPlan.servicePlanId}/prices/${priceId}`);
      alert('Đã xóa giá');
      await fetchPrices(editingPlan.servicePlanId);
      fetchPlans();
    } catch (error) {
      alert('Lỗi xóa giá');
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
        alert('Thêm sản phẩm thành công!');
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
        alert('Cập nhật thành công!');
      }

      // Upload image if selected
      if (selectedFile && planId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/service-plans/${planId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Cập nhật hình ảnh thành công!');
      }

      setShowModal(false);
      fetchPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA (vô hiệu hóa) sản phẩm "${name}"?`)) return;
    
    try {
      await api.delete(`/service-plans/${id}`);
      alert('Đã xóa sản phẩm');
      fetchPlans();
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  const filteredPlans = plans.filter(p => 
    p.servicePlanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản phẩm / Dịch vụ</h1>
            <p className="text-slate-500">Thêm, sửa, xóa các gói Cloud VPS, Hosting, Domains</p>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Thêm Sản Phẩm
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-700 w-16">Ảnh</th>
                  <th className="p-4 font-semibold text-slate-700">Tên sản phẩm</th>
                  <th className="p-4 font-semibold text-slate-700">Danh mục</th>
                  <th className="p-4 font-semibold text-slate-700">Giá cơ bản</th>
                  <th className="p-4 font-semibold text-slate-700 hidden md:table-cell">Thông số (C/R/S)</th>
                  <th className="p-4 font-semibold text-slate-700 text-center w-24">Status</th>
                  <th className="p-4 font-semibold text-slate-700 text-right w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.servicePlanId} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                          {plan.imageUrl ? (
                            <img src={'http://localhost:5053' + plan.imageUrl} alt={plan.servicePlanName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{plan.servicePlanName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1" title={plan.servicePlanId}>
                          {plan.servicePlanId.split('-')[0]}...
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {plan.categoryName || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-emerald-600">
                        {plan.price ? plan.price.toLocaleString('vi-VN') + ' đ' : 'Chưa set giá'}
                      </td>
                      <td className="p-4 text-slate-600 hidden md:table-cell text-sm">
                        {plan.cpu && <div>CPU: <span className="font-medium text-slate-800">{plan.cpu}</span></div>}
                        {plan.ram && <div>RAM: <span className="font-medium text-slate-800">{plan.ram}</span></div>}
                        {plan.ssd && <div>SSD: <span className="font-medium text-slate-800">{plan.ssd}</span></div>}
                      </td>
                      <td className="p-4 text-center">
                        {plan.isActive !== false ? (
                          <span className="inline-flex items-center justify-center text-emerald-500" title="Active">
                            <CheckCircle className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-red-500" title="Inactive">
                            <XCircle className="w-5 h-5" />
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPricingModal(plan)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Cấu hình Giá"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(plan)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Sửa cấu hình sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.servicePlanId, plan.servicePlanName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlan ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="VD: Cloud VPS Pro 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Danh mục *</label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  Thông số kỹ thuật (Tùy chọn)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">CPU</label>
                    <input
                      type="text"
                      list="cpu-suggestions"
                      value={formCpu}
                      onChange={e => setFormCpu(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="VD: 2 Cores"
                    />
                    <datalist id="cpu-suggestions">
                      <option value="1 Core" />
                      <option value="2 Cores" />
                      <option value="4 Cores" />
                      <option value="6 Cores" />
                      <option value="8 Cores" />
                      <option value="12 Cores" />
                      <option value="16 Cores" />
                      <option value="32 Cores" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">RAM</label>
                    <input
                      type="text"
                      list="ram-suggestions"
                      value={formRam}
                      onChange={e => setFormRam(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="VD: 4 GB"
                    />
                    <datalist id="ram-suggestions">
                      <option value="1 GB" />
                      <option value="2 GB" />
                      <option value="4 GB" />
                      <option value="8 GB" />
                      <option value="12 GB" />
                      <option value="16 GB" />
                      <option value="32 GB" />
                      <option value="64 GB" />
                      <option value="128 GB" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">SSD / Ổ cứng</label>
                    <input
                      type="text"
                      list="ssd-suggestions"
                      value={formSsd}
                      onChange={e => setFormSsd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="VD: 50 GB NVMe"
                    />
                    <datalist id="ssd-suggestions">
                      <option value="10 GB NVMe" />
                      <option value="20 GB NVMe" />
                      <option value="25 GB NVMe" />
                      <option value="30 GB NVMe" />
                      <option value="40 GB NVMe" />
                      <option value="50 GB NVMe" />
                      <option value="80 GB NVMe" />
                      <option value="100 GB NVMe" />
                      <option value="150 GB NVMe" />
                      <option value="250 GB NVMe" />
                      <option value="500 GB NVMe" />
                      <option value="1 TB NVMe" />
                      <option value="2x 500GB SSD" />
                      <option value="2x 1TB NVMe" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Băng thông</label>
                    <input
                      type="text"
                      list="bw-suggestions"
                      value={formBandwidth}
                      onChange={e => setFormBandwidth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="VD: Unlimited"
                    />
                    <datalist id="bw-suggestions">
                      <option value="Unlimited" />
                      <option value="1Gbps / 10TB" />
                      <option value="1Gbps / 20TB" />
                      <option value="10Gbps / Unmetered" />
                      <option value="100 Mbps" />
                      <option value="1 Gbps" />
                      <option value="10 Gbps" />
                    </datalist>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Ảnh Sản Phẩm (Thumbnail)
                </label>
                
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className="space-y-1 text-center">
                    {previewImage ? (
                      <div className="w-32 h-32 mx-auto relative rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                        <img src={previewImage.startsWith('blob:') ? previewImage : `http://localhost:5053${previewImage}`} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    )}
                    <div className="flex text-sm text-slate-600 justify-center mt-4">
                      <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                        {previewImage ? 'Thay đổi hình ảnh' : 'Tải ảnh lên'}
                      </span>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP lên đến 2MB</p>
                  </div>
                </div>
              </div>


              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu Sản Phẩm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && editingPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                  Quản lý Giá
                </h2>
                <p className="text-slate-500 text-sm mt-1">Sản phẩm: {editingPlan.servicePlanName}</p>
              </div>
              <button 
                onClick={() => setShowPricingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-5 rounded-xl border border-slate-200 mb-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                  {priceFormId ? 'Cập nhật mức giá' : 'Thêm mức giá mới'}
                </h3>
                <form onSubmit={handleSavePrice} className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chu kỳ thanh toán</label>
                    <select
                      value={priceFormCycle}
                      onChange={(e) => setPriceFormCycle(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value={1}>Hàng tháng (Monthly)</option>
                      <option value={2}>Hàng năm (Yearly)</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Giá tiền (VND)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={priceFormAmount}
                        onChange={(e) => setPriceFormAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pr-12"
                        placeholder="VD: 50000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">VNĐ</span>
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-70 h-[42px] flex items-center justify-center min-w-[120px]"
                    >
                      {isSaving ? 'Đang lưu...' : (priceFormId ? 'Cập nhật' : 'Thêm Mới')}
                    </button>
                  </div>
                  {priceFormId && (
                    <div>
                      <button
                        type="button"
                        onClick={resetPricingForm}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors h-[42px]"
                      >
                        Hủy Sửa
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold text-slate-700">Chu kỳ</th>
                      <th className="p-4 font-semibold text-slate-700">Giá (VND)</th>
                      <th className="p-4 font-semibold text-slate-700">Ngày hiệu lực</th>
                      <th className="p-4 font-semibold text-slate-700 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isPricingLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
                    ) : currentPrices.length > 0 ? (
                      currentPrices.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-900">
                            {p.billingCycle === 1 ? '1 Tháng' : p.billingCycle === 2 ? '1 Năm' : `${p.billingCycle} Tháng`}
                          </td>
                          <td className="p-4 font-medium text-emerald-600">
                            {p.price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {new Date(p.effectiveFrom).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditPrice(p)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePrice(p.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          Chưa có cấu hình giá nào cho sản phẩm này.
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
