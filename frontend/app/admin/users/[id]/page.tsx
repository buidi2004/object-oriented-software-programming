'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, AlertCircle, Loader } from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        setError('Không tìm thấy người dùng.');
      }
    } catch {
      setError('Không thể tải thông tin người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-slate-600">{error}</p>
        <Link href="/admin/users" className="mt-4 text-blue-600 font-semibold">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin/users" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Chi tiết người dùng</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {user.fullName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Vai trò</p>
              <p className="flex items-center gap-1 mt-1 font-semibold"><Shield className="w-4 h-4 text-blue-600" /> {user.roleName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Trạng thái</p>
              <p className={`mt-1 font-semibold ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                {user.isActive ? 'Hoạt động' : 'Bị khóa'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Ngày tạo</p>
              <p className="mt-1">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">User ID</p>
              <p className="mt-1 font-mono text-xs text-slate-600">{user.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
