'use client';

import { useEffect, useState } from 'react';
import { Check, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '@/src/lib/api';

type Address = { id: string; fullName: string; phoneNumber: string; company?: string; taxCode?: string; addressLine: string; city: string; postalCode?: string; isDefault: boolean };
const emptyForm = { fullName: '', phoneNumber: '', company: '', taxCode: '', addressLine: '', city: '', postalCode: '', isDefault: false };

export function CheckoutAddressBook({ onSelect }: { onSelect?: (address: Address) => void }) {
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    try {
      const { data } = await api.get('/billing-addresses');
      setItems(data);
      const selected = data.find((x: Address) => x.isDefault) ?? data[0];
      if (selected) onSelect?.(selected);
    } catch { setMessage('Không thể tải sổ địa chỉ.'); }
  };
  useEffect(() => { load(); }, []);
  const create = async () => {
    try {
      await api.post('/billing-addresses', form);
      setForm(emptyForm); setShowForm(false); setMessage('Đã lưu địa chỉ.'); await load();
    } catch (e: any) { setMessage(e.response?.data?.message ?? 'Không thể lưu địa chỉ.'); }
  };
  const makeDefault = async (item: Address) => { await api.put('/billing-addresses/' + item.id + '/default'); onSelect?.(item); await load(); };
  const remove = async (id: string) => { await api.delete('/billing-addresses/' + id); await load(); };
  const fields = [['fullName','Họ và tên'],['phoneNumber','Số điện thoại'],['company','Công ty'],['taxCode','Mã số thuế'],['addressLine','Địa chỉ'],['city','Tỉnh/Thành phố'],['postalCode','Mã bưu chính']] as const;
  return <section className="bg-white border border-slate-200 rounded-lg p-6">
    <div className="flex items-center justify-between gap-4 mb-4"><div><h2 className="font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" />Địa chỉ thanh toán</h2><p className="text-sm text-slate-500">Chọn địa chỉ xuất hóa đơn cho đơn hàng này.</p></div><button type="button" onClick={() => setShowForm(v => !v)} className="p-2 border rounded-lg" title="Thêm địa chỉ"><Plus className="w-5 h-5" /></button></div>
    {message && <p className="text-sm text-blue-700 mb-3">{message}</p>}
    {showForm && <div className="grid sm:grid-cols-2 gap-3 p-4 bg-slate-50 border rounded-lg mb-4">
      {fields.map(([key,label]) => <input key={key} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={label} className="px-3 py-2 border rounded-lg text-sm" />)}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e=>setForm({...form,isDefault:e.target.checked})}/>Đặt làm mặc định</label><button type="button" onClick={create} className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Lưu địa chỉ</button>
    </div>}
    <div className="space-y-2">{items.length === 0 ? <p className="text-sm text-slate-500">Chưa có địa chỉ. Hãy thêm địa chỉ đầu tiên.</p> : items.map(item => <div key={item.id} className={'flex items-start gap-3 p-3 border rounded-lg ' + (item.isDefault ? 'border-blue-500 bg-blue-50' : 'border-slate-200')}><button type="button" onClick={()=>makeDefault(item)} className="mt-0.5" title="Chọn địa chỉ">{item.isDefault ? <Check className="w-5 h-5 text-blue-600"/> : <span className="block w-5 h-5 rounded-full border-2"/>}</button><div className="flex-1"><p className="font-semibold text-sm">{item.fullName} · {item.phoneNumber}</p><p className="text-sm text-slate-600">{item.addressLine}, {item.city}</p>{item.company && <p className="text-xs text-slate-500">{item.company} · MST {item.taxCode || 'chưa có'}</p>}</div><button type="button" onClick={()=>remove(item.id)} className="p-1 text-rose-600" title="Xóa"><Trash2 className="w-4 h-4"/></button></div>)}</div>
  </section>;
}
