'use client';

import { useState } from 'react';
import { Pin } from 'lucide-react';
import { api } from '@/src/lib/api';

export function PinServiceButton({ serviceType, serviceId, displayName }: { serviceType: 'VPS' | 'DOMAIN' | 'SSL'; serviceId: string; displayName: string }) {
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setBusy(true);
    try {
      const response = await api.post('/pinned-services/toggle', { serviceType, serviceId, displayName });
      setPinned(response.data.pinned);
    } finally {
      setBusy(false);
    }
  };
  return <button type="button" onClick={toggle} disabled={busy} title={pinned ? 'Bỏ ghim' : 'Ghim vào Quick Access'} className={'p-2 rounded-lg border transition-colors ' + (pinned ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-[#1F1F1F]')}><Pin className={'w-4 h-4 ' + (pinned ? 'fill-current' : '')}/></button>;
}
