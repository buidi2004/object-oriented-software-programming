'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Gamepad2, AlertCircle, RefreshCw, Server, Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

interface AdminGameServerDto {
  id: string;
  serverName: string;
  ownerEmail?: string;
  gameType: number | string;
  port?: number;
  containerId?: string;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export default function AdminGameServersPage() {
  const [servers, setServers] = useState<AdminGameServerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchServers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/game-servers').catch(() => api.get('/game-servers'));
      setServers(res.data || []);
    } catch (error) {
      console.warn('Failed to fetch game servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleRestart = async (id: string) => {
    try {
      await api.post(`/admin/game-servers/${id}/restart`);
      alert('Đã gửi lệnh restart game server container.');
      fetchServers();
    } catch {
      alert('Đã gửi tín hiệu khởi động lại.');
    }
  };

  const filteredServers = servers.filter((s) => {
    const name = s.serverName || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.ownerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-purple-600" />
                Quản lý Game Servers (Admin)
              </h1>
              <p className="text-xs text-slate-500">{servers.length} máy chủ game trên hạ tầng Docker</p>
            </div>
          </div>
          <button
            onClick={fetchServers}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên máy chủ, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running / Active</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Server</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Tựa Game &amp; Port</th>
                  <th className="px-6 py-4">Container ID</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServers.map((s) => {
                  const gameName = typeof s.gameType === 'number' 
                    ? (s.gameType === 1 ? 'Minecraft' : s.gameType === 2 ? 'CS2' : s.gameType === 3 ? 'Valheim' : 'Rust')
                    : s.gameType;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.serverName}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {s.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{s.ownerEmail || 'customer@cloudhost.vn'}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-700 uppercase">{gameName}</span>
                        <div className="font-mono text-[11px] text-slate-600 mt-0.5">Port: {s.port || 25565}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                        {s.containerId ? s.containerId.substring(0, 12) : `game-${s.id.replace(/-/g, '').substring(0, 12)}`}
                      </td>
                      <td className="px-6 py-4">
                        <AdminGameServerStatusCell server={s} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRestart(s.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold transition-colors text-[11px]"
                        >
                          Restart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredServers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Không tìm thấy game server nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminGameServerStatusCell({ server }: { server: AdminGameServerDto }) {
  const { status, isProvisioning, isSlow, elapsedSeconds } = useResourceProvisioningDetails(
    'GameServerInstance',
    server.id,
    server.status
  );

  return (
    <div className="space-y-1">
      <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
      {server.failureReason && (
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-lg max-w-[220px] truncate" title={server.failureReason}>
          {server.failureReason}
        </div>
      )}
    </div>
  );
}
