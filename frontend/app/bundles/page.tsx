'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers3, Loader2, ShoppingCart } from 'lucide-react';
import { api } from '@/src/lib/api';
import { requestAuth } from '@/src/lib/authNavigation';

type Bundle = { id: string; name: string; description: string; imageUrl?: string; discountPercent: number; includedPlanIdsJson: string };
export default function BundlesPage() {
  const [items,setItems]=useState<Bundle[]>([]); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(''); const [message,setMessage]=useState('');
  useEffect(()=>{api.get('/service-bundles').then(response=>setItems(response.data||[])).catch(()=>setMessage('Không thể tải danh sách combo.')).finally(()=>setLoading(false));},[]);
  const add=async(id:string)=>{if(!localStorage.getItem('accessToken')){requestAuth('login','/bundles');return;}setBusy(id);try{const response=await api.post('/service-bundles/'+id+'/add-to-cart');setMessage('Đã thêm '+response.data.added+' dịch vụ vào giỏ hàng.');}catch(error:any){setMessage(error.response?.data?.message||'Không thể thêm combo.');}finally{setBusy('');}};
  return <main className="max-w-6xl mx-auto px-4 py-10"><div className="flex items-end justify-between gap-4 mb-8"><div><h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Layers3 className="w-8 h-8 text-blue-600"/>Gói combo tiết kiệm</h1><p className="text-slate-500 mt-2">Mua nhiều dịch vụ cùng lúc với mức giá ưu đãi.</p></div><Link href="/cart" className="text-blue-600 font-semibold">Xem giỏ hàng</Link></div>{message&&<p className="mb-5 p-3 bg-blue-50 text-blue-800 rounded-lg">{message}</p>}{loading?<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>:items.length===0?<div className="border rounded-lg p-10 text-center text-slate-500">Chưa có combo hoạt động. Admin có thể tạo qua API quản trị.</div>:<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(item=><article key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden"><div className="p-6"><span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">Giảm {item.discountPercent}%</span><h2 className="text-xl font-bold mt-4">{item.name}</h2><p className="text-sm text-slate-500 mt-2 min-h-10">{item.description}</p><p className="text-xs text-slate-400 mt-4">{JSON.parse(item.includedPlanIdsJson||'[]').length} dịch vụ trong combo</p><button type="button" onClick={()=>add(item.id)} disabled={busy===item.id} className="mt-5 w-full bg-blue-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2">{busy===item.id?<Loader2 className="w-4 h-4 animate-spin"/>:<ShoppingCart className="w-4 h-4"/>}Thêm toàn bộ vào giỏ</button></div></article>)}</div>}</main>;
}
