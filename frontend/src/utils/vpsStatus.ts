export const VPS_STATUS_MAP: Record<string, { label: string; color: string }> = {
  Provisioning: { label: 'Đang tạo',  color: 'bg-amber-100 text-amber-700' },
  Running:      { label: 'Đang chạy', color: 'bg-emerald-100 text-emerald-700' },
  Stopped:      { label: 'Đã dừng',   color: 'bg-slate-100 text-slate-600' },
  Terminated:   { label: 'Đã huỷ',    color: 'bg-slate-100 text-slate-700' },
  Failed:       { label: 'Lỗi',       color: 'bg-rose-100 text-rose-700' },
  Suspended:    { label: 'Tạm ngừng', color: 'bg-orange-100 text-orange-700' },
};

export function getVpsStatusMeta(status: string | number) {
  if (typeof status === 'number') {
    const legacyMap: Record<number, string> = {
      1: 'Provisioning',
      2: 'Running',
      3: 'Stopped',
      4: 'Terminated',
      5: 'Failed',
      6: 'Suspended',
    };
    status = legacyMap[status] ?? 'Stopped';
  }

  return VPS_STATUS_MAP[status] ?? VPS_STATUS_MAP.Failed;
}

export function formatRamMb(ramMb: number) {
  if (ramMb >= 1024) {
    return `${(ramMb / 1024).toFixed(ramMb % 1024 === 0 ? 0 : 1)} GB`;
  }
  return `${ramMb} MB`;
}
