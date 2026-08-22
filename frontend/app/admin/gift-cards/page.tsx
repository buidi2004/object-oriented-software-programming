'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2, 
  Gift, Search, RefreshCw, Copy, Check, Calendar, DollarSign, X
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  remainingAmount: number;
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
}

export default function AdminGiftCardsPage() {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    amount: '100000',
    expiryDays: '180'
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
      if (response.data?.role !== 'Admin') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchGiftCards();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchGiftCards = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/gift-cards');
      if (Array.isArray(res.data)) {
        setGiftCards(res.data.map((c: any) => ({
          id: c.id,
          code: c.code,
          amount: c.amount || 0,
          remainingAmount: c.remainingAmount ?? c.amount ?? 0,
          isActive: c.isActive ?? true,
          expiryDate: c.expiryDate,
          createdAt: c.createdAt || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('Vui lòng nhập mệnh giá hợp lệ.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const days = parseInt(formData.expiryDays) || 180;
      const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      await api.post('/gift-cards', {
        code: formData.code.trim() ? formData.code.trim().toUpperCase() : undefined,
        amount: amountVal,
        expiryDate
      });

      showToast('Tạo thẻ quà tặng mới thành công!');
      setShowAddModal(false);
      setFormData({ code: '', amount: '100000', expiryDays: '180' });
      fetchGiftCards();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể tạo thẻ quà tặng.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy kích hoạt thẻ quà tặng "${code}"?`)) return;
    try {
      await api.delete(`/gift-cards/${id}`);
      setGiftCards(prev => prev.map(c => c.id === id ? { ...c, isActive: false } : c));
      showToast(`Đã vô hiệu hóa thẻ "${code}"!`);
    } catch (error) {
      console.error('Failed to delete gift card:', error);
      showToast('Lỗi khi hủy kích hoạt thẻ', 'error');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredGiftCards = giftCards.filter(gc => {
    const matchesSearch = gc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const isExpired = gc.expiryDate ? new Date(gc.expiryDate) < new Date() : false;
    const isUsed = gc.remainingAmount <= 0;

    if (filter === 'active') return matchesSearch && gc.isActive && !isExpired && !isUsed;
    if (filter === 'used') return matchesSearch && (isUsed || !gc.isActive || isExpired);
    return matchesSearch;
  });

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
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
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
            <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Thẻ Quà Tặng (Gift Cards)</h1>
              <p className="text-xs text-slate-600">{giftCards.length} thẻ quà tặng trong hệ thống</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchGiftCards}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo Thẻ Mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã thẻ quà tặng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm font-mono"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Còn hiệu lực' },
              { id: 'used', label: 'Đã dùng / Hết hạn' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                  filter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGiftCards.map((card) => {
            const isExpired = card.expiryDate ? new Date(card.expiryDate) < new Date() : false;
            const isUsed = card.remainingAmount <= 0;
            const isAvailable = card.isActive && !isExpired && !isUsed;

            return (
              <div 
                key={card.id} 
                className="bg-white rounded-md border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-sm bg-indigo-50 text-[#1F1F1F] flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isAvailable 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isAvailable ? 'Có thể sử dụng' : isUsed ? 'Đã sử dụng hết' : !card.isActive ? 'Đã vô hiệu hóa' : 'Đã hết hạn'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(card.id, card.code)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                      title="Vô hiệu hóa thẻ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Code Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-4 flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                      {card.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(card.code)}
                      className="p-1.5 text-slate-600 hover:text-[#1F1F1F] hover:bg-white rounded-sm transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedCode === card.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Values */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mệnh giá ban đầu:</span>
                      <span className="font-bold text-slate-900">{card.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số dư còn lại:</span>
                      <span className="font-bold text-[#1F1F1F]">{card.remainingAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    {card.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hạn sử dụng:</span>
                        <span>{new Date(card.expiryDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Tạo ngày {new Date(card.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGiftCards.length === 0 && (
          <div className="text-center py-16 bg-white rounded-md border border-slate-200 text-slate-600">
            <Gift className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-bold text-slate-700">Không tìm thấy thẻ quà tặng nào</p>
            <p className="text-xs text-slate-600 mt-1">Bấm "Tạo Thẻ Mới" để phát hành mã thẻ</p>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Phát Hành Thẻ Quà Tặng Mới</h3>
                <p className="text-xs text-slate-600 mt-0.5">Tạo mã nạp tiền trực tiếp vào tài khoản</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã thẻ quà tặng (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Để trống để hệ thống tự sinh mã tự động"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mệnh giá (VNĐ)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    placeholder="100000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-4 pr-12 py-2.5 rounded border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
                    VNĐ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thời hạn hiệu lực (Số ngày)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="180"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Thẻ Quà Tặng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
