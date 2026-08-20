'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUnreadCount(0);
    }
  }, [user]);

  if (!user) return null;

  return (
    <button
      onClick={() => router.push('/dashboard/notifications')}
      className="relative p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
      title="Thông báo"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
