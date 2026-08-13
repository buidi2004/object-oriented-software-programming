import React from 'react';
import type { OsTemplateKey, DatacenterRegionKey } from '../types';

interface OsTemplateIconProps {
  os: OsTemplateKey;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMap = { sm: 36, md: 44 };

/** Icon OS chuẩn thương hiệu — thay emoji 🐧🛡️🪟 */
export type { OsTemplateKey, DatacenterRegionKey } from '../types';

export function OsTemplateIcon({ os, size = 'sm', className = '' }: OsTemplateIconProps) {
  const px = sizeMap[size];

  const wrap = (bg: string, children: React.ReactNode) => (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl shadow-sm ${bg} ${className}`}
      style={{ width: px, height: px }}
    >
      {children}
    </span>
  );

  switch (os) {
    case 'ubuntu':
      return wrap('bg-[#E95420]', (
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden>
          <circle cx="12" cy="5.5" r="2.2" fill="white" />
          <circle cx="7" cy="16" r="2.2" fill="white" />
          <circle cx="17" cy="16" r="2.2" fill="white" />
          <path d="M10.2 7.2c1.2 2.8 3.4 5 6.2 6.2M13.8 7.2c-1.2 2.8-3.4 5-6.2 6.2" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      ));
    case 'debian':
      return wrap('bg-[#A80030]', (
        <svg viewBox="0 0 24 24" className="w-[62%] h-[62%]" aria-hidden>
          <path
            fill="white"
            d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 2.5c-1.8 0-3.4.6-4.7 1.6 1.2.3 2.3.9 3.2 1.7 1.4-1.1 3.2-1.8 5.2-1.8.4 0 .8 0 1.2.1-1.5-1-3.3-1.6-5.2-1.6h.3zm-5.8 3.2c-.9 1.2-1.4 2.7-1.4 4.3 0 1.2.3 2.3.8 3.3 1.5-.5 2.8-1.4 3.8-2.6-1.3-1.6-2.2-3.5-2.5-5.6-.2.2-.5.4-.7.6zm11.6 0c-.3 2.1-1.2 4-2.5 5.6 1 1.2 2.3 2.1 3.8 2.6.5-1 .8-2.1.8-3.3 0-1.6-.5-3.1-1.4-4.3-.2-.2-.5-.4-.7-.6zM12 8.5c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5z"
          />
        </svg>
      ));
    case 'almalinux':
      return wrap('bg-[#0F4266]', (
        <svg viewBox="0 0 24 24" className="w-[58%] h-[58%]" aria-hidden>
          <path
            fill="#10B981"
            d="M12 3l7 4v10l-7 4-7-4V7l7-4z"
            opacity="0.95"
          />
          <path fill="white" d="M12 7.5l4.5 2.6v5.2L12 18l-4.5-2.7v-5.2L12 7.5z" />
        </svg>
      ));
    case 'windows':
      return wrap('bg-[#0078D4]', (
        <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden>
          <path fill="white" d="M3 5.5h8.5V12H3V5.5zm9.5 0H21V12h-8.5V5.5zM3 13h8.5v5.5H3V13zm9.5 0H21v5.5h-8.5V13z" />
        </svg>
      ));
    default:
      return wrap('bg-slate-500', (
        <span className="text-white text-xs font-bold">OS</span>
      ));
  }
}

interface DatacenterLocationIconProps {
  region: DatacenterRegionKey;
  className?: string;
}

/** Icon vị trí DC: cờ + pin map */
export function DatacenterLocationIcon({ region, className = '' }: DatacenterLocationIconProps) {
  const flags: Record<DatacenterRegionKey, { emoji: string; stripe: string }> = {
    'vn-hn': { emoji: '🇻🇳', stripe: 'from-red-500 via-yellow-400 to-red-600' },
    'vn-hcm': { emoji: '🇻🇳', stripe: 'from-red-500 via-yellow-400 to-red-600' },
    sg: { emoji: '🇸🇬', stripe: 'from-red-500 via-white to-red-500' },
  };
  const f = flags[region];

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
        <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.stripe}`} />
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
    cpu: 'text-blue-600 bg-blue-50',
    ram: 'text-indigo-600 bg-indigo-50',
    disk: 'text-cyan-600 bg-cyan-50',
    network: 'text-emerald-600 bg-emerald-50',
    os: 'text-violet-600 bg-violet-50',
    datacenter: 'text-rose-600 bg-rose-50',
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
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${styles[type]} ${className}`}>
      {icons[type]}
    </span>
  );
}
