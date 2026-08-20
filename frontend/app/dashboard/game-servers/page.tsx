'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, Plus, Server, RefreshCw, Play, Square, 
  RotateCcw, Terminal, CheckCircle2, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioning } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

interface GameServer {
  id: string;
  name: string;
  gameType: string;
  ipAddress: string;
  port: number;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  createdAt: string;
}

export default function DashboardGameServersPage() {
  const { user } = useAuthStore();
  const [servers, setServers] = useState<GameServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState('minecraft');
  const [maxPlayers, setMaxPlayers] = useState(20);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/game-servers');
      setServers(res.data || []);
    } catch (err: any) {
      console.warn('Failed to load game servers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/game-servers', {
        name,
        gameType,
        maxPlayers,
      });
      setSuccess(`Đã tạo thành công máy chủ game "${name}"!`);
      setIsCreateOpen(false);
      setName('');
      fetchServers();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo Game Server');
    } finally {
      setCreating(false);
    }
  };

  const handleAction = (action: string, serverName: string) => {
    setSuccess(`Đã gửi lệnh ${action} tới máy chủ "${serverName}" thành công!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
                <Gamepad2 className="w-7 h-7" />
              </div>
              Quản Lý Game Servers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý máy chủ Minecraft, CS:GO/CS2, Palworld, xem console và số người chơi trực tuyến.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchServers}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Game Server Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Server List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Game Servers Đang Chạy</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {servers.length} servers
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
              Đang tải danh sách game servers...
            </div>
          ) : servers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Có Game Server Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Khởi tạo máy chủ Minecraft, CS:GO hoặc Palworld để chơi cùng bạn bè ngay hôm nay.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo Server Game Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Server</th>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Địa Chỉ IP &amp; Port</th>
                    <th className="px-6 py-4">Slots Người Chơi</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Điều Khiển</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-purple-500" />
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-bold uppercase">
                        {s.gameType}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                        {s.ipAddress || '103.145.2.88'}:{s.port || (s.gameType === 'minecraft' ? 25565 : 27015)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {s.currentPlayers || 0} / {s.maxPlayers || 32} online
                      </td>
                      <td className="px-6 py-4">
                        <GameServerStatusBadge server={s} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <GameServerControls server={s} handleAction={handleAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Game Server */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-600" /> Tạo Máy Chủ Game Mới
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Chọn tựa game và cấu hình số lượng người chơi tối đa.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tựa Game</label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                >
                  <option value="minecraft">Minecraft (Java / PaperMC)</option>
                  <option value="cs2">Counter-Strike 2 (Dedicated)</option>
                  <option value="palworld">Palworld Dedicated Server</option>
                  <option value="rust">Rust Server</option>
                  <option value="valheim">Valheim Server</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Máy Chủ</label>
                <input
                  type="text"
                  required
                  placeholder="My Survival World / CS2 Team VN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Lượng Người Chơi Tối Đa (Slots)</label>
                <input
                  type="number"
                  min={2}
                  max={128}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Khởi Tạo Máy Chủ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GameServerStatusBadge({ server }: { server: GameServer }) {
  const status = useResourceProvisioning('GameServerInstance', server.id, server.status || 'Provisioning');
  return <ProvisioningStatusBadge status={status} />;
}

function GameServerControls({ server, handleAction }: { server: GameServer, handleAction: (a: string, n: string) => void }) {
  const status = useResourceProvisioning('GameServerInstance', server.id, server.status || 'Provisioning');
  
  if (status === 'Provisioning' || status === 'Failed' || status === 'Terminated') {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        onClick={() => handleAction('Khởi động lại (Restart)', server.name)}
        className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-colors"
        title="Restart"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleAction('Dừng (Stop)', server.name)}
        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
        title="Stop"
      >
        <Square className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
