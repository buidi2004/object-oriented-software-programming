'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Server, AlertCircle, Cpu, Database, HardDrive, Trash2, Loader2 } from 'lucide-react';
import { getVpsStatusMeta, formatRamMb } from '@/src/utils/vpsStatus';

interface VpsInstanceDto {
  id: string;
  containerName: string;
  containerId: string;
  status: string;
  cpuCores: number;
  ramMb: number;
  diskGb?: number;
  planName: string;
  customerEmail?: string;
  createdAt: string;
  expiresAt: string;
}

export default function AdminVpsInstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<VpsInstanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [editingVps, setEditingVps] = useState<VpsInstanceDto | null>(null);
  const [createForm, setCreateForm] = useState({
    containerName: '',
    cpuCores: 2,
    ramMb: 4096,
    diskGb: 50,
    planName: 'Cloud VPS Pro'
  });
  const [editForm, setEditForm] = useState({
    cpuCores: 2,
    ramMb: 4096,
    diskGb: 50,
    planName: 'Cloud VPS Pro',
    status: 'Running'
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        const isAllowed = ['Admin', 'Technician', 'Staff'].some(
          r => r.toLowerCase() === (userData.role || '').toLowerCase()
        );
        if (!isAllowed) {
          router.push('/dashboard');
          return;
        }
        fetchInstances(token);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchInstances = async (token: string) => {
    try {
      const response = await fetch('/api/VpsInstances/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInstances(data);
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (instance: VpsInstanceDto) => {
    if (!confirm(`Bạn có chắc muốn hủy/xóa VPS "${instance.containerName}"?\n(Dữ liệu container sẽ bị xóa, trạng thái chuyển sang Đã huỷ)`)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setDeletingId(instance.id);
    try {
      const response = await fetch(`/api/VpsInstances/${instance.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok || response.status === 204) {
        // Just mark as terminated in UI instead of hiding it, since it's a soft delete
        setInstances(prev => prev.map(i => i.id === instance.id ? { ...i, status: 'Terminated' } : i));
        alert('Đã huỷ VPS thành công!');
      } else {
        alert('Huỷ VPS thất bại. Lỗi: ' + response.status);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Huỷ VPS thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateVps = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch('/api/VpsInstances/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          containerName: createForm.containerName.trim(),
          cpuCores: Number(createForm.cpuCores) || 2,
          ramMb: Number(createForm.ramMb) || 4096,
          diskGb: Number(createForm.diskGb) || 50,
          planName: createForm.planName
        })
      });
      if (res.ok) {
        setIsCreating(false);
        alert('Cấp phát VPS mới thành công!');
        fetchInstances(token);
      } else {
        alert('Lỗi cấp phát VPS: ' + res.status);
      }
    } catch {
      alert('Lỗi khi cấp phát VPS.');
    }
  };

  const handleUpdateVps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVps) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`/api/VpsInstances/${editingVps.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cpuCores: Number(editForm.cpuCores),
          ramMb: Number(editForm.ramMb),
          diskGb: Number(editForm.diskGb),
          planName: editForm.planName,
          status: editForm.status
        })
      });
      if (res.ok) {
        setEditingVps(null);
        alert('Cập nhật cấu hình VPS thành công!');
        fetchInstances(token);
      } else {
        alert('Lỗi khi cập nhật cấu hình: ' + res.status);
      }
    } catch {
      alert('Lỗi khi cập nhật cấu hình VPS.');
    }
  };

  const handleBulkDeleteTerminated = async () => {
    const terminated = instances.filter(i => i.status === 'Terminated');
    if (terminated.length === 0) { alert('Không có VPS nào ở trạng thái Terminated.'); return; }
    if (!confirm(`Xóa vĩnh viễn ${terminated.length} bản ghi VPS đã huỷ khỏi cơ sở dữ liệu?\nHành động này không thể hoàn tác!`)) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setBulkDeleting(true);

    const deletedIds: string[] = [];
    for (const inst of terminated) {
      try {
        const res = await fetch(`/api/VpsInstances/${inst.id}/hard`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 204) deletedIds.push(inst.id);
      } catch { /* skip failed */ }
    }
    setInstances(prev => prev.filter(i => !deletedIds.includes(i.id)));
    setBulkDeleting(false);
    alert(`Đã xóa vĩnh viễn ${deletedIds.length}/${terminated.length} bản ghi VPS thành công.`);
  };

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.containerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.customerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.containerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const runningCount = instances.filter((i) => i.status === 'Running').length;
  const stoppedCount = instances.filter((i) =>
    i.status === 'Stopped' || i.status === 'Terminated' || i.status === 'Failed' || i.status === 'Suspended'
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quản lý VPS Instances</h1>
              <p className="text-sm text-slate-500">{instances.length} instances tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Cấp Phát VPS
            </button>
            <span className="px-3 py-1.5 rounded-sm bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {runningCount} Running
            </span>
            <span className="px-3 py-1.5 rounded-sm bg-red-100 text-red-700 text-sm font-semibold">
              {stoppedCount} Stopped/Failed
            </span>
            <button
              onClick={handleBulkDeleteTerminated}
              disabled={bulkDeleting}
              className="px-3 py-1.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Xóa tất cả đã huỷ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded p-4 border border-white/10 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, container ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running — Đang chạy</option>
            <option value="Provisioning">Provisioning — Đang tạo</option>
            <option value="Stopped">Stopped — Đã dừng</option>
            <option value="Suspended">Suspended — Tạm ngừng</option>
            <option value="Terminated">Terminated — Đã huỷ</option>
            <option value="Failed">Failed — Lỗi</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstances.map((instance) => {
            const statusMeta = getVpsStatusMeta(instance.status);
            return (
              <div key={instance.id} className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded border border-white/10 p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{instance.containerName}</h3>
                      <p className="text-xs font-mono text-slate-500">{instance.containerId.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />CPU</span>
                    <span className="font-semibold">{instance.cpuCores} vCPU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" />RAM</span>
                    <span className="font-semibold">{formatRamMb(instance.ramMb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />Disk</span>
                    <span className="font-semibold">{instance.diskGb ? `${instance.diskGb} GB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="font-semibold">{instance.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="font-semibold">{instance.customerEmail ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hết hạn</span>
                    <span className="font-semibold">{new Date(instance.expiresAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingVps(instance);
                      setEditForm({
                        cpuCores: instance.cpuCores,
                        ramMb: instance.ramMb,
                        diskGb: instance.diskGb || 50,
                        planName: instance.planName,
                        status: instance.status
                      });
                    }}
                    className="flex-1 py-2 rounded-sm border border-blue-200 text-blue-400 hover:bg-blue-900/30 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(instance)}
                    disabled={deletingId === instance.id}
                    className="flex-1 py-2 rounded-sm border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {deletingId === instance.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstances.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">Không tìm thấy instance nào</p>
          </div>
        )}
      </main>

      {/* Modal Cấp Phát VPS */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Cấp Phát VPS Thủ Công
            </h3>
            <form onSubmit={handleCreateVps} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Máy Chủ / Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="vps-prod-worker"
                  value={createForm.containerName}
                  onChange={(e) => setCreateForm({ ...createForm, containerName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">vCPU</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.cpuCores}
                    onChange={(e) => setCreateForm({ ...createForm, cpuCores: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">RAM (MB)</label>
                  <input
                    type="number"
                    min="1024"
                    step="1024"
                    value={createForm.ramMb}
                    onChange={(e) => setCreateForm({ ...createForm, ramMb: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Disk (GB)</label>
                  <input
                    type="number"
                    min="10"
                    value={createForm.diskGb}
                    onChange={(e) => setCreateForm({ ...createForm, diskGb: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Gói Cước</label>
                <input
                  type="text"
                  value={createForm.planName}
                  onChange={(e) => setCreateForm({ ...createForm, planName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Cấp Phát Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Cấu Hình VPS */}
      {editingVps && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Sửa Cấu Hình VPS: {editingVps.containerName}</h3>
            <form onSubmit={handleUpdateVps} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">vCPU</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.cpuCores}
                    onChange={(e) => setEditForm({ ...editForm, cpuCores: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">RAM (MB)</label>
                  <input
                    type="number"
                    min="1024"
                    step="1024"
                    required
                    value={editForm.ramMb}
                    onChange={(e) => setEditForm({ ...editForm, ramMb: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Disk (GB)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={editForm.diskGb}
                    onChange={(e) => setEditForm({ ...editForm, diskGb: Number(e.target.value) })}
                    className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Gói</label>
                <input
                  type="text"
                  required
                  value={editForm.planName}
                  onChange={(e) => setEditForm({ ...editForm, planName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Trạng Thái</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Running">Running</option>
                  <option value="Stopped">Stopped</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVps(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
