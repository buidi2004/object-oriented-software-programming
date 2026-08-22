'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, Plus, Shield, RefreshCw, Key, ExternalLink, 
  Trash2, Lock, CheckCircle2, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface EmailAccount {
  id: string;
  email: string;
  domain: string;
  quotaMB: number;
  usedMB: number;
  status: string;
  createdAt: string;
}

export default function DashboardEmailHostingPage() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('mydomain.com');
  const [password, setPassword] = useState('');
  const [quotaMB, setQuotaMB] = useState(2048);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/email-hosting/accounts');
      setAccounts(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load email accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/email-hosting/accounts', {
        email: `${username}@${domain}`,
        domain,
        password,
        quotaMB,
      });
      setSuccess(`Đã tạo thành công hòm thư ${username}@${domain}!`);
      setIsCreateOpen(false);
      setUsername('');
      setPassword('');
      fetchAccounts();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo hòm thư');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-rose-100 text-rose-600">
                <Mail className="w-7 h-7" />
              </div>
              Quản Lý Email Doanh Nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tạo hòm thư theo tên miền, quản lý dung lượng, đổi mật khẩu và đăng nhập Webmail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAccounts}
              className="p-2.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Hòm Thư Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Mailboxes List */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Hòm Thư Active</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {accounts.length} hòm thư
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-rose-600" />
              Đang tải danh sách hòm thư...
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Hòm Thư Nào</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
                Bạn chưa tạo hòm thư email doanh nghiệp nào. Hãy nhấn vào nút bên dưới để tạo ngay!
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-md bg-rose-600 text-slate-900 font-bold text-xs shadow-md"
              >
                + Tạo Hòm Thư Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Địa Chỉ Email</th>
                    <th className="px-6 py-4">Tên Miền</th>
                    <th className="px-6 py-4">Dung Lượng</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-rose-500" />
                        {acc.email}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{acc.domain}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {acc.usedMB || 0} MB / {acc.quotaMB || 2048} MB
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          Hoạt động
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="https://webmail.cloudhost.vn"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Webmail
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Email */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-600" /> Tạo Hòm Thư Doanh Nghiệp Mới
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Điền tên tài khoản và mật khẩu để kích hoạt hòm thư mới.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Hòm Thư</label>
                <div className="flex rounded overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-rose-500">
                  <input
                    type="text"
                    required
                    placeholder="contact / info / admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs text-slate-900 outline-none"
                  />
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold border-l border-slate-200">
                    @{domain}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật Khẩu Hòm Thư</label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 8 ký tự, gồm chữ & số"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dung Lượng (MB)</label>
                <select
                  value={quotaMB}
                  onChange={(e) => setQuotaMB(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value={1024}>1,024 MB (1 GB)</option>
                  <option value={2048}>2,048 MB (2 GB)</option>
                  <option value={5120}>5,120 MB (5 GB)</option>
                  <option value={10240}>10,240 MB (10 GB)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-700 text-slate-900 font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Xác Nhận Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
