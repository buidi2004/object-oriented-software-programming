'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Pin, Server } from 'lucide-react';
import { api } from '@/src/lib/api';

type Vip = { currentTier: string; discountPercent: number; totalSpent: number; nextTierName?: string; amountToNextTier: number };
type PinItem = { id: string; serviceType: string; serviceId: string; displayName: string };

export function DashboardLoyaltyWidgets() {
  const [vip, setVip] = useState<Vip | null>(null);
  const [pins, setPins] = useState<PinItem[]>([]);
  useEffect(() => {
    Promise.all([api.get('/vip-club/me'), api.get('/pinned-services')])
      .then(([vipResponse, pinResponse]) => { setVip(vipResponse.data); setPins(pinResponse.data); })
      .catch(() => undefined);
  }, []);
  const hrefFor = (item: PinItem) => item.serviceType === 'VPS'
    ? '/dashboard/vps-instances/' + item.serviceId
    : item.serviceType === 'DOMAIN' ? '/domains/' + item.serviceId : '/dashboard/ssl-certificates';
  const progress = vip?.nextTierName
    ? Math.max(5, 100 - (vip.amountToNextTier / Math.max(1, vip.totalSpent + vip.amountToNextTier)) * 100)
    : 100;

  return <div className="grid lg:grid-cols-3 gap-4">
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center gap-3"><Crown className="w-7 h-7 text-amber-500"/><div><p className="text-xs text-slate-500">Hạng thành viên</p><h2 className="font-black text-xl">{vip?.currentTier ?? 'Đồng'}</h2></div><span className="ml-auto text-sm font-bold text-emerald-700">-{vip?.discountPercent ?? 0}%</span></div>
      <div className="h-2 bg-slate-100 rounded-full mt-4 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: progress + '%' }}/></div>
      <p className="text-xs text-slate-500 mt-2">{vip?.nextTierName ? 'Còn ' + vip.amountToNextTier.toLocaleString('vi-VN') + 'đ để lên ' + vip.nextTierName : 'Bạn đang ở hạng cao nhất'}</p>
    </section>
    <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3"><Pin className="w-5 h-5 text-[#1F1F1F]"/><h2 className="font-bold">Dịch vụ đã ghim · Quick Access</h2></div>
      {pins.length === 0 ? <p className="text-sm text-slate-500">Ghim VPS, Domain hoặc SSL từ trang quản lý để truy cập nhanh.</p> : <div className="grid sm:grid-cols-2 gap-2">{pins.map(item => <Link key={item.id} href={hrefFor(item)} className="flex items-center gap-3 border rounded-lg p-3 hover:border-blue-400"><Server className="w-4 h-4 text-[#1F1F1F]"/><div><p className="text-sm font-semibold">{item.displayName}</p><p className="text-xs text-slate-500">{item.serviceType}</p></div></Link>)}</div>}
    </section>
  </div>;
}
