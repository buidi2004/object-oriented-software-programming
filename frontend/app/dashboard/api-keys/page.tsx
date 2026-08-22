'use client';

import { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import { Key, Copy, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  scopes: string;
  createdAt: string;
  revokedAt: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scopes, setScopes] = useState({ read: true, write: false, admin: false });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      // Wait for 500ms to show loading state for better UX
      await new Promise(r => setTimeout(r, 500));
      const res = await api.get<ApiKey[]>('/api-keys/me');
      setKeys(res.data);
    } catch (err: any) {
      setError('Lỗi khi tải danh sách API Keys.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const selectedScopes = Object.entries(scopes)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(',');

    try {
      const res = await api.post('/api-keys', { scopes: selectedScopes });
      setNewKey(res.data.key);
      fetchKeys(); // Refresh list
    } catch (err: any) {
      alert('Không thể tạo API Key. Vui lòng thử lại.');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi API Key này?')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      fetchKeys();
    } catch (err: any) {
      alert('Lỗi khi thu hồi API Key.');
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewKey(null);
    setScopes({ read: true, write: false, admin: false });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Key className="w-8 h-8 text-[#1F1F1F]" />
            Quản lý API Keys
          </h1>
          <p className="text-gray-500 mt-2">Quản lý các khóa bảo mật để lập trình viên giao tiếp với hệ thống.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo API Key mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID / Token</th>
              <th className="px-6 py-4">Quyền (Scopes)</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chưa có API Key nào được tạo.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">
                    {key.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {key.scopes.split(',').map((scope) => (
                        <span key={scope} className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-[#1F1F1F] rounded-sm">
                          {scope.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(key.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    {key.revokedAt ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Đã thu hồi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!key.revokedAt && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-sm hover:bg-red-50 transition-colors"
                        title="Thu hồi khóa này"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tạo API Key Mới</h2>
              
              {!newKey ? (
                <>
                  <p className="text-gray-500 text-sm mb-6">
                    Chọn các quyền truy cập bạn muốn cấp cho khóa này.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <label className="flex items-center gap-3 p-3 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={scopes.read}
                        onChange={(e) => setScopes({...scopes, read: e.target.checked})}
                        className="w-5 h-5 rounded text-[#1F1F1F] focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Read</div>
                        <div className="text-sm text-gray-500">Quyền đọc dữ liệu</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={scopes.write}
                        onChange={(e) => setScopes({...scopes, write: e.target.checked})}
                        className="w-5 h-5 rounded text-[#1F1F1F] focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Write</div>
                        <div className="text-sm text-gray-500">Quyền chỉnh sửa dữ liệu</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={scopes.admin}
                        onChange={(e) => setScopes({...scopes, admin: e.target.checked})}
                        className="w-5 h-5 rounded text-[#1F1F1F] focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Admin</div>
                        <div className="text-sm text-gray-500">Quyền quản trị toàn quyền</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={closeCreateModal}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm font-medium transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={!scopes.read && !scopes.write && !scopes.admin}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-sm font-medium transition-colors"
                    >
                      Tạo Khóa
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="text-sm text-amber-800">
                        <strong className="block mb-1">Sao chép khóa bí mật của bạn!</strong>
                        Vì lý do bảo mật, mã này sẽ <strong>không bao giờ hiển thị lại</strong> sau khi bạn đóng cửa sổ này.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-8">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-sm p-3 font-mono text-sm text-gray-800 break-all">
                      {newKey}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className={`p-3 rounded-sm transition-colors flex items-center justify-center ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-[#1F1F1F] hover:bg-indigo-100'
                      }`}
                      title="Sao chép"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={closeCreateModal}
                      className="bg-white hover:bg-gray-800 text-slate-900 px-6 py-2 rounded-sm font-medium transition-colors w-full"
                    >
                      Tôi đã lưu mã này
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
