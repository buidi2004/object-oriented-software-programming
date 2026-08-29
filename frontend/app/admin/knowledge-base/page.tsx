'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, FileText, Search, AlertCircle, 
  Eye, CheckCircle2, X, Upload, Image as ImageIcon, FileUp, 
  Sparkles, ExternalLink, RefreshCw, Layers, ShieldCheck, Database,
  Server, Globe, Boxes, Compass
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  categoryTag: string;
  content: string;
  viewCount: number;
  isPublished: boolean;
  authorId?: string;
}

const CATEGORIES = [
  'Máy Chủ & Cloud VPS',
  'Web Server & Nginx',
  'Cơ Sở Dữ Liệu',
  'Bảo Mật & SSL/WAF',
  'Container & Docker',
  'Tên Miền & DNS',
  'Khác'
];

export default function AdminKnowledgeBasePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryTag, setCategoryTag] = useState(CATEGORIES[0]);
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      const isAllowed = ['Admin', 'Technician', 'Editor', 'Support', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) {
        router.push('/dashboard');
        return;
      }
      fetchArticles();
    } catch {
      router.push('/login');
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/knowledge-base/all');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data);
      } else {
        // Try fallback published endpoint
        const pubRes = await api.get('/knowledge-base');
        setArticles(Array.isArray(pubRes.data) ? pubRes.data : []);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      // Fallback
      try {
        const pubRes = await api.get('/knowledge-base');
        setArticles(Array.isArray(pubRes.data) ? pubRes.data : []);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setCategoryTag(CATEGORIES[0]);
    setContent('');
    setIsPublished(true);
    setUploadSuccess(null);
    setShowModal(true);
  };

  const handleOpenEditModal = async (art: KBArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setCategoryTag(art.categoryTag || CATEGORIES[0]);
    setIsPublished(art.isPublished);
    setUploadSuccess(null);
    setShowModal(true);

    // Fetch full content if not present
    if (!art.content) {
      try {
        const res = await api.get(`/knowledge-base/${art.id}`);
        if (res.data?.content) {
          setContent(res.data.content);
        }
      } catch {
        setContent(art.content || '');
      }
    } else {
      setContent(art.content);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingArticle) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/knowledge-base/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url) {
        const fileUrl = res.data.url;
        if (res.data.isImage) {
          const imgSnippet = `\n<img src="${fileUrl}" alt="${file.name}" class="rounded-xl border shadow-sm my-4 max-w-full" />\n`;
          setContent(prev => prev + imgSnippet);
          setUploadSuccess(`Đã tải lên hình ảnh ${file.name} và tự động chèn vào bài viết!`);
        } else {
          const fileSnippet = `\n<a href="${fileUrl}" target="_blank" download class="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg border border-blue-200 font-bold text-xs my-2">📥 Tải file đính kèm: ${file.name}</a>\n`;
          setContent(prev => prev + fileSnippet);
          setUploadSuccess(`Đã tải lên tệp tin ${file.name} và chèn link tải vào bài viết!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Tải file lên thất bại. Vui lòng kiểm tra kích thước file (tối đa 20MB).');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề, slug và nội dung bài viết.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingArticle) {
        // Update
        await api.put(`/knowledge-base/${editingArticle.id}`, {
          id: editingArticle.id,
          title: title.trim(),
          slug: slug.trim(),
          categoryTag,
          content: content.trim(),
          isPublished
        });
      } else {
        // Create
        await api.post('/knowledge-base', {
          title: title.trim(),
          slug: slug.trim(),
          categoryTag,
          content: content.trim(),
          isPublished
        });
      }
      setShowModal(false);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu bài viết. Vui lòng kiểm tra lại slug hoặc thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, artTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết hướng dẫn: "${artTitle}"?`)) return;
    try {
      await api.delete(`/knowledge-base/${id}`);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Xóa bài viết thất bại.');
    }
  };

  const handleSeedArticles = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/knowledge-base/seed');
      alert(res.data?.message || 'Đã tiêm bài viết mẫu vào CSDL thành công!');
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Tiêm dữ liệu mẫu thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => {
    const matchCat = selectedCategory === 'all' || (a.categoryTag || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = !searchTerm.trim() || 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.categoryTag || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalViews = articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
  const publishedCount = articles.filter(a => a.isPublished).length;
  const draftCount = articles.filter(a => !a.isPublished).length;

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="p-2.5 rounded-xl border border-white/10 hover:bg-[#0F172A] text-slate-500 hover:text-white transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Quản Lý Thư Viện Tài Liệu (Knowledge Base)</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-900/50 text-blue-800 rounded-full">CRM Docs</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Soạn thảo, quản lý bài viết hướng dẫn kỹ thuật, đính kèm file và hình ảnh minh họa</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedArticles}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-200 font-bold text-xs transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              title="Khôi phục hoặc tiêm 6 bài viết chuẩn vào CSDL"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Tiêm / Khôi Phục CSDL</span>
            </button>

            <Link
              href="/knowledge-base"
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold text-xs transition-all shadow-2xs flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem Trang Khách</span>
            </Link>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Bài Viết Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{articles.length}</div>
              <div className="text-xs text-slate-500 font-medium">Tổng Bài Viết</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{publishedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Đã Xuất Bản</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{draftCount}</div>
              <div className="text-xs text-slate-500 font-medium">Bản Nháp (Ẩn)</div>
            </div>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">Lượt Xem Toàn Hệ Thống</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Tất Cả ({articles.length})
            </button>
            {CATEGORIES.filter(c => c !== 'Khác').map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, slug, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Articles Table */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải danh sách bài viết...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p>Chưa có bài viết nào phù hợp với bộ lọc.</p>
              <button
                onClick={handleSeedArticles}
                className="px-4 py-2 bg-blue-900/30 text-blue-300 font-bold text-xs rounded-xl border border-blue-200 hover:bg-blue-900/50 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Tiêm 6 Bài Viết Chuẩn Vào CSDL
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-[#0F172A] border-b border-white/10 text-slate-200 font-black uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Bài Viết &amp; Tiêu Đề</th>
                    <th className="py-3.5 px-4">Chuyên Mục</th>
                    <th className="py-3.5 px-4 text-center">Lượt Xem</th>
                    <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-[#0F172A]/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{art.title}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">slug: {art.slug}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-900/30 text-blue-300 font-bold text-[11px] border border-blue-200/60">
                          {art.categoryTag || 'VPS'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-200">
                        {(art.viewCount || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {art.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Xuất Bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> Bản Nháp
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/knowledge-base/${art.id}`}
                            target="_blank"
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Xem trang khách hàng"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleOpenEditModal(art)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa bài viết"
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
          )}
        </div>

      </div>

      {/* Modal: Create / Edit Article */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>{editingArticle ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Hướng Dẫn Mới'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tích hợp upload hình ảnh, file đính kèm và định dạng HTML/Markdown</p>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hướng Dẫn Cấu Hình SSL Nginx Let's Encrypt Tự Động"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Đường Dẫn Slug URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="huong-dan-cau-hinh-ssl-nginx"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Chuyên Mục Kỹ Thuật</label>
                  <select
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Attachment & Image Bar */}
              <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">Tải tệp &amp; hình ảnh:</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.zip,.sh,.txt,.conf,.yml,.yaml"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-white/10 text-slate-200 font-bold text-xs rounded-lg border border-white/10 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>{uploading ? 'Đang tải lên...' : 'Tải Ảnh / Tệp Đính Kèm'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Hỗ trợ JPG, PNG, WebP, PDF, Zip, Config (tối đa 20MB)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Nội Dung Bài Viết (HTML / Markdown) *
                </label>
                <textarea
                  rows={10}
                  required
                  placeholder="Nhập nội dung bài viết hướng dẫn. Bạn có thể dùng các thẻ HTML như <h3>, <p>, <pre><code>, <img>, <a>..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0F172A] border border-white/10 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-blue-400 rounded focus:ring-blue-500 border-white/20"
                  />
                  <span className="text-xs font-bold text-slate-200">Xuất bản công khai trên website</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white/10 transition-colors"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{editingArticle ? 'Lưu Thay Đổi' : 'Tạo Bài Viết'}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
