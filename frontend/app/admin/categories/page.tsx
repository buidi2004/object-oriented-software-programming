'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Search, FolderTree, AlertCircle } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchCategories(token);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const fetchCategories = async (token: string) => {
    try {
      const response = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((c: any) => ({
          ...c,
          description: c.description || 'Chưa có mô tả',
          serviceCount: c.serviceCount || 0,
          createdAt: c.createdAt || new Date().toISOString()
        })));
      }
    } catch (error) { console.error('Failed to fetch categories:', error); }
    finally { setIsLoading(false); }
  };

  const handleCreateCategory = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCategory),
      });
      setShowAddModal(false);
      fetchCategories(token!);
    } catch (error) { console.error('Failed to create category:', error); }
  };

  const handleDeleteCategory = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) { console.error('Failed to delete category:', error); }
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Danh mục</h1>
              <p className="text-sm text-slate-500">{categories.length} danh mục</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tên danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mô tả</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Số dịch vụ</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày tạo</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{category.slug}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{category.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {category.serviceCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Chưa có danh mục nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm danh mục mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên danh mục</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="VD: Cloud VPS, Web Hosting..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="vd: cloud-vps"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Mô tả ngắn gọn về danh mục..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateCategory} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                Lưu
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
