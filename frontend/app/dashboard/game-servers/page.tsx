'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, Plus, Server, RefreshCw, Play, Square, 
  RotateCcw, Terminal, CheckCircle2, AlertCircle, ArrowLeft, AlertTriangle 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface GameServer {
  id: string;
  serverName: string;
  name?: string;
  gameType: number | string;
  ipAddress?: string;
  port?: number;
  maxPlayers?: number;
  currentPlayers?: number;
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
  const [serverName, setServerName] = useState('');
  const [gameType, setGameType] = useState('1'); // 1=Minecraft, 2=CS2, 3=Valheim, 4=Rust
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
      const gType = parseInt(gameType, 10);
      const res = await api.post('/game-servers', {
        serverName,
        gameType: gType,
      });

      const newId = res.data?.serverId || `game-${Date.now()}`;
      const newServer: GameServer = {
        id: newId,
        serverName,
        name: serverName,
        gameType: gType,
        status: 'Provisioning',
        createdAt: new Date().toISOString(),
      };

      setServers((prev) => [newServer, ...prev]);
      setSuccess(`Đã tiếp nhận yêu cầu khởi tạo máy chủ "${serverName}"! Quá trình tải image và sinh thế giới game thường mất khoảng 30s - 120s...`);
      setIsCreateOpen(false);
      setServerName('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo Game Server');
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
              Khởi tạo máy chủ Minecraft, Counter-Strike 2, Valheim hoặc Rust với tài nguyên CPU/RAM bảo đảm và lưu trữ dữ liệu bền vững.
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
            <h2 className="text-base font-bold text-slate-900">Danh Sách Game Servers</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {servers.length} servers
            </span>
          </div>

          {loading && servers.length === 0 ? (
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
                Khởi tạo máy chủ Minecraft hoặc CS2 để chơi cùng bạn bè ngay hôm nay.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md"
              >
                + Tạo Server Game Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {servers.map((s) => (
                <GameServerRowItem key={s.id} server={s} onRefresh={fetchServers} />
              ))}
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
              Chọn tựa game và cấu hình tên máy chủ.
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
                  <option value="1">Minecraft (Java / Vanilla)</option>
                  <option value="2">Counter-Strike 2 (Dedicated)</option>
                  <option value="3">Valheim Dedicated Server</option>
                  <option value="4">Rust Dedicated Server</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Máy Chủ</label>
                <input
                  type="text"
                  required
                  placeholder="My Survival World / CS2 VN Team"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
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

function GameServerRowItem({ server, onRefresh }: { server: GameServer; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'GameServerInstance',
    server.id,
    server.status
  );

  const displayName = server.serverName || server.name || 'Game Server';
  const gameTypeName = typeof server.gameType === 'number'
    ? (server.gameType === 1 ? 'Minecraft' : server.gameType === 2 ? 'CS2' : server.gameType === 3 ? 'Valheim' : 'Rust')
    : server.gameType;

  const host = server.ipAddress || '127.0.0.1';
  const port = server.port || 25565;

  return (
    <div className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{displayName}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                {gameTypeName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              IP & Port: {host}:{port}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
        </div>
      </div>

      {/* Slow Warning Banner */}
      {isSlow && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{slowWarningText}</span>
        </div>
      )}

      {/* Failed State Alert */}
      {status === 'Failed' && (
        <ResourceFailureAlert
          resourceName={`Game Server ${displayName}`}
          onRetry={() => {
            onRefresh();
          }}
          supportHref="/dashboard/tickets"
        />
      )}
    </div>
  );
}
