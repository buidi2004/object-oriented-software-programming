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

  const [isCreating, setIsCreating] = useState(false);
  const [editingServer, setEditingServer] = useState<AdminGameServerDto | null>(null);
  const [createForm, setCreateForm] = useState({
    serverName: '',
    gameType: 0, // 0 for Minecraft
    port: 25565
  });
  const [editForm, setEditForm] = useState({
    serverName: '',
    port: 25565
  });

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

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.serverName.trim()) return alert('Vui lòng nhập tên server');
    try {
      await api.post('/admin/game-servers', {
        serverName: createForm.serverName.trim(),
        gameType: Number(createForm.gameType),
        port: Number(createForm.port) || 25565
      });
      setIsCreating(false);
      alert('Khởi tạo Game Server thành công!');
      fetchServers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi tạo game server');
    }
  };

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;
    try {
      await api.put(`/admin/game-servers/${editingServer.id}`, {
        serverName: editForm.serverName,
        port: Number(editForm.port)
      });
      setEditingServer(null);
      alert('Cập nhật Game Server thành công!');
      fetchServers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật game server');
    }
  };

  const handleDeleteServer = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa Game Server ${name}?`)) return;
    try {
      await api.delete(`/admin/game-servers/${id}`);
      alert('Đã xóa game server thành công!');
      fetchServers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa game server');
    }
  };

  const handleRestart = async (id: string) => {
    try {
      await api.post(`/admin/game-servers/${id}/restart`);
      alert('Đã gửi lệnh restart game server container.');
      fetchServers();
    } catch {
      alert('Đã gửi tín hiệu khởi động lại.');
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

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
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-purple-600" />
                Quản lý Game Servers (Admin)
              </h1>
              <p className="text-xs text-slate-500">{servers.length} máy chủ game trên hạ tầng Docker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Khởi Tạo Game Server
            </button>
            <button
              onClick={fetchServers}
              className="p-2 rounded border border-white/10 bg-[#1E293B] bg-opacity-70 backdrop-blur-md hover:bg-[#0F172A] text-slate-500 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-4 border border-white/10 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên máy chủ, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#1E293B] bg-opacity-70 backdrop-blur-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running / Active</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-[#0F172A] text-white border-b border-white/10 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Server</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Tựa Game &amp; Port</th>
                  <th className="px-6 py-4">Container ID</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredServers.map((s) => {
                  const gameName = typeof s.gameType === 'number' 
                    ? (s.gameType === 1 ? 'Minecraft' : s.gameType === 2 ? 'CS2' : s.gameType === 3 ? 'Valheim' : 'Rust')
                    : s.gameType;

                  return (
                    <tr key={s.id} className="hover:bg-[#0F172A]/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{s.serverName}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {s.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">{s.ownerEmail || 'customer@cloudhost.vn'}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-700 uppercase">{gameName}</span>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">Port: {s.port || 25565}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {s.containerId ? s.containerId.substring(0, 12) : `game-${s.id.replace(/-/g, '').substring(0, 12)}`}
                      </td>
                      <td className="px-6 py-4">
                        <AdminGameServerStatusCell server={s} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingServer(s);
                            setEditForm({
                              serverName: s.serverName,
                              port: s.port || 25565
                            });
                          }}
                          className="px-2.5 py-1.5 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 font-bold transition-colors text-[11px]"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleRestart(s.id)}
                          className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-purple-50 text-slate-200 hover:text-purple-700 font-bold transition-colors text-[11px]"
                        >
                          Restart
                        </button>
                        <button
                          onClick={() => handleDeleteServer(s.id, s.serverName)}
                          className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                        >
                          Xóa
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
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy game server nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tạo Game Server */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-600" />
              Khởi Tạo Máy Chủ Game
            </h3>
            <form onSubmit={handleCreateServer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Máy Chủ Game</label>
                <input
                  type="text"
                  required
                  placeholder="Minecraft Survival Season 5"
                  value={createForm.serverName}
                  onChange={(e) => setCreateForm({ ...createForm, serverName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tựa Game</label>
                  <select
                    value={createForm.gameType}
                    onChange={(e) => setCreateForm({ ...createForm, gameType: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={0}>Minecraft Java</option>
                    <option value={1}>Counter-Strike 2</option>
                    <option value={2}>Valheim</option>
                    <option value={3}>Rust Dedicated</option>
                    <option value={4}>Palworld</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Cổng Port</label>
                  <input
                    type="number"
                    value={createForm.port}
                    onChange={(e) => setCreateForm({ ...createForm, port: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded"
                >
                  Khởi Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Game Server */}
      {editingServer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Sửa Máy Chủ Game: {editingServer.serverName}</h3>
            <form onSubmit={handleUpdateServer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Máy Chủ</label>
                <input
                  type="text"
                  required
                  value={editForm.serverName}
                  onChange={(e) => setEditForm({ ...editForm, serverName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Cổng Port</label>
                <input
                  type="number"
                  required
                  value={editForm.port}
                  onChange={(e) => setEditForm({ ...editForm, port: Number(e.target.value) })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingServer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-sm max-w-[220px] truncate" title={server.failureReason}>
          {server.failureReason}
        </div>
      )}
    </div>
  );
}
