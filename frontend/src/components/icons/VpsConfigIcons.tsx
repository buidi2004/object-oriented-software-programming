import React from 'react';
import type { OsTemplateKey, DatacenterRegionKey } from '../../types';

interface OsTemplateIconProps {
  os: OsTemplateKey;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMap = { sm: 36, md: 44 };

/** Icon OS chuẩn thương hiệu — thay emoji 🐧🛡️🪟 */
export type { OsTemplateKey, DatacenterRegionKey } from '../../types';

export function OsTemplateIcon({ os, size = 'sm', className = '' }: OsTemplateIconProps) {
  const px = sizeMap[size];

  const wrap = (src: string, alt: string) => (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded bg-white border border-slate-200 shadow-sm overflow-hidden p-1.5 ${className}`}
      style={{ width: px, height: px }}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </span>
  );

  switch (os) {
    case 'ubuntu':
      return wrap('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg', 'Ubuntu');
    case 'debian':
      return wrap('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/debian/debian-original.svg', 'Debian');
    case 'almalinux':
      return wrap('https://upload.wikimedia.org/wikipedia/commons/2/23/AlmaLinux_logo.svg', 'AlmaLinux');
    case 'windows':
      return wrap('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg', 'Windows');
    default:
      return (
        <span
          className={`inline-flex shrink-0 items-center justify-center rounded bg-slate-100 border border-slate-200 ${className}`}
          style={{ width: px, height: px }}
        >
          <span className="text-slate-600 text-xs font-bold">OS</span>
        </span>
      );
  }
}

interface DatacenterLocationIconProps {
  region: DatacenterRegionKey;
  className?: string;
}

/** Icon vị trí DC: cờ + pin map */
export function DatacenterLocationIcon({ region, className = '' }: DatacenterLocationIconProps) {
  const flags: Record<DatacenterRegionKey, { emoji: string }> = {
    'vn-hn': { emoji: '🇻🇳' },
    'vn-hcm': { emoji: '🇻🇳' },
    sg: { emoji: '🇸🇬' },
  };
  const f = flags[region];

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100 border border-slate-200 overflow-hidden">
        <span className="text-lg leading-none mt-0.5" role="img" aria-hidden>
          {f.emoji}
        </span>
      </span>
    </span>
  );
}

/** Icon tài nguyên VPS — màu theo loại */
export function ResourceIcon({
  type,
  className = '',
}: {
  type: 'cpu' | 'ram' | 'disk' | 'network' | 'os' | 'datacenter';
  className?: string;
}) {
  const styles = {
    cpu: 'text-[#1F1F1F] bg-blue-50',
    ram: 'text-[#1F1F1F] bg-blue-50',
    disk: 'text-[#1F1F1F] bg-blue-50',
    network: 'text-[#1F1F1F] bg-blue-50',
    os: 'text-[#1F1F1F] bg-blue-50',
    datacenter: 'text-[#1F1F1F] bg-blue-50',
  };

  const icons = {
    cpu: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" strokeLinecap="round" />
      </svg>
    ),
    ram: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="8" width="18" height="8" rx="1.5" />
        <path d="M7 12h2M11 12h2M15 12h2M7 16v2M11 16v2M15 16v2" strokeLinecap="round" />
      </svg>
    ),
    disk: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </svg>
    ),
    network: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 12h14M12 5v14" strokeLinecap="round" opacity="0" />
        <path d="M2 12c2-4 6-6 10-6s8 2 10 6c-2 4-6 6-10 6s-8-2-10-6z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
    os: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" strokeLinecap="round" />
      </svg>
    ),
    datacenter: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded ${styles[type]} ${className}`}>
      {icons[type]}
    </span>
  );
}
