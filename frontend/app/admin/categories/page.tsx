'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Search, FolderTree, 
  AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  serviceCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  
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
      const isAllowed = ['Admin', 'Editor', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) { 
        router.push('/dashboard'); 
        return; 
      }
      fetchCategories();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories');
      if (Array.isArray(response.data)) {
        setCategories(response.data.map((c: any) => ({
          ...c,
          description: c.description || 'Chưa có mô tả',
          serviceCount: c.serviceCount || 0,
          createdAt: c.createdAt || new Date().toISOString()
        })));
      }
    } catch (error) { 
      console.error('Failed to fetch categories:', error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    try {
      await api.post('/categories', {
        name: formData.name,
        slug: formData.slug,
        description: formData.description
      });
      setShowAddModal(false);
      setFormData({ name: '', slug: '', description: '' });
      showToast('Thêm danh mục mới thành công!');
      fetchCategories();
    } catch (error) { 
      console.error('Failed to create category:', error); 
      showToast('Lỗi khi thêm danh mục', 'error');
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.name.trim() || !formData.slug.trim()) return;

    try {
      await api.put(`/categories/${editingId}`, {
        id: editingId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description
      });
      setShowEditModal(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '' });
      showToast('Cập nhật danh mục thành công!');
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      showToast('Lỗi khi cập nhật danh mục', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Đã xóa danh mục "${name}" thành công!`);
    } catch (error) { 
      console.error('Failed to delete category:', error); 
      showToast('Lỗi khi xóa danh mục', 'error');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-lg text-white font-medium text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quản lý Danh mục Dịch vụ</h1>
              <p className="text-xs text-slate-500">{categories.length} danh mục có sẵn</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: '', slug: '', description: '' });
              setShowAddModal(true);
            }} 
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          />
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F172A] border-b border-white/10">
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-200">Tên danh mục</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-200">Slug URL</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-200">Mô tả</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-200">Số gói dịch vụ</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-200">Ngày tạo</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#0F172A]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-sm bg-blue-900/30 text-[#1F1F1F] flex items-center justify-center font-bold">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-white">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{category.slug}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{category.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                        {category.serviceCount} gói
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditClick(category)} 
                          className="p-2 text-slate-500 hover:text-[#1F1F1F] hover:bg-blue-900/30 rounded-sm transition-colors"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id, category.name)} 
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy danh mục nào phù hợp</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Thêm danh mục dịch vụ mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setFormData({ ...formData, name, slug: formData.slug || slug });
                  }}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="VD: Cloud VPS, Dedicated Server..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Slug URL</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="vd: cloud-vps"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Mô tả ngắn gọn về danh mục dịch vụ..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded bg-white/10 text-slate-200 font-semibold text-sm hover:bg-white/20 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Lưu Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Cập nhật danh mục</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Slug URL</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase mb-1.5">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded bg-white/10 text-slate-200 font-semibold text-sm hover:bg-white/20 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Cập Nhật Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
