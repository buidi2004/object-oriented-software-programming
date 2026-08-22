'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '@/src/lib/api';

export function TicketCsat({ ticketId }: { ticketId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    api.get('/tickets/' + ticketId + '/feedback').then(response => {
      if (response.data) { setRating(response.data.rating); setComment(response.data.comment || ''); setDone(true); }
    }).catch(() => undefined);
  }, [ticketId]);
  const submit = async () => {
    try { await api.post('/tickets/' + ticketId + '/feedback', { rating, comment, tags: [] }); setDone(true); setMessage('Cảm ơn bạn đã đánh giá hỗ trợ.'); }
    catch (error: any) { setMessage(error.response?.data?.message || 'Không thể gửi đánh giá.'); }
  };
  return <section className="mt-4 bg-white border border-slate-200 rounded-sm p-5">
    <h2 className="font-bold mb-1">Đánh giá chất lượng hỗ trợ</h2><p className="text-sm text-slate-600 mb-3">Chấm điểm kỹ thuật viên sau khi ticket đã đóng.</p>
    <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(value => <button type="button" key={value} disabled={done} onClick={() => setRating(value)} title={value + ' sao'}><Star className={'w-7 h-7 ' + (value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600')}/></button>)}</div>
    <textarea disabled={done} value={comment} onChange={event => setComment(event.target.value)} maxLength={500} placeholder="Nhận xét của bạn" className="w-full border rounded-sm p-3 text-sm"/>
    {!done && <button type="button" disabled={!rating} onClick={submit} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-sm font-semibold disabled:opacity-50">Gửi đánh giá</button>}
    {message && <p className="text-sm text-emerald-700 mt-2">{message}</p>}
  </section>;
}
