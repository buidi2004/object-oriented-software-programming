'use client';

import { useEffect, useState } from 'react';
import { Bell, Clock3, Loader2, MessageCircleQuestion, Send, Sparkles } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/src/lib/api';
import { requestAuth } from '@/src/lib/authNavigation';

type HistoryItem = { id: string; oldPrice: number; newPrice: number; currency: string; reason?: string; changedAt: string };
type Answer = { id: string; content: string; isStaffAnswer: boolean; createdAt: string };
type Question = { id: string; content: string; createdAt: string; answers: Answer[] };
type Trial = { status: string; startsAt?: string; expiresAt?: string };

export function ServicePlanEngagement({ planId, currentPrice }: { planId: string; currentPrice: number }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [trial, setTrial] = useState<Trial>({ status: 'Available' });
  const [question, setQuestion] = useState('');
  const [targetPrice, setTargetPrice] = useState(currentPrice || 0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const load = async () => {
    const [historyResult, questionResult] = await Promise.all([
      api.get('/service-plans/' + planId + '/price-history').catch(() => ({ data: [] })),
      api.get('/service-plans/' + planId + '/questions').catch(() => ({ data: [] })),
    ]);
    setHistory(historyResult.data || []);
    setQuestions(questionResult.data || []);
    if (token) api.get('/free-trials/my-status').then(response => setTrial(response.data)).catch(() => undefined);
  };
  useEffect(() => { load(); }, [planId]);
  const requireLogin = () => { if (!token) { requestAuth('login', '/services/plans/' + planId); return false; } return true; };
  const subscribe = async () => { if (!requireLogin()) return; setBusy('alert'); try { await api.post('/stock-alerts', { servicePlanId: planId, targetPrice: targetPrice || null, notifyWhenAvailable: true }); setMessage('Đã bật thông báo có hàng và giảm giá.'); } catch (error: any) { setMessage(error.response?.data?.message || 'Không thể tạo cảnh báo.'); } finally { setBusy(''); } };
  const startTrial = async () => { if (!requireLogin()) return; setBusy('trial'); try { const response = await api.post('/free-trials/request', { servicePlanId: planId }); setTrial(response.data); setMessage('Dùng thử VPS đã được kích hoạt trong 3 ngày.'); } catch (error: any) { setMessage(error.response?.data?.message || 'Không thể kích hoạt dùng thử.'); } finally { setBusy(''); } };
  const ask = async () => { if (!question.trim() || !requireLogin()) return; setBusy('question'); try { await api.post('/service-plans/' + planId + '/questions', { content: question }); setQuestion(''); setMessage('Câu hỏi đã được đăng.'); await load(); } catch (error: any) { setMessage(error.response?.data?.message || 'Không thể gửi câu hỏi.'); } finally { setBusy(''); } };
  const chartData = history.map(item => ({ date: new Date(item.changedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), price: item.newPrice }));

  return <div className="mt-8 grid lg:grid-cols-3 gap-6">
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600"/>Cảnh báo giá & có hàng</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">Nhận thông báo khi giá đạt mức bạn mong muốn.</p>
      <label className="text-sm font-semibold">Giá mục tiêu<input type="number" min="0" value={targetPrice} onChange={event=>setTargetPrice(Number(event.target.value))} className="mt-2 w-full border rounded-lg px-3 py-2"/></label>
      <button type="button" onClick={subscribe} disabled={busy==='alert'} className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2">{busy==='alert'?<Loader2 className="w-4 h-4 animate-spin"/>:<Bell className="w-4 h-4"/>}Theo dõi gói này</button>
    </section>
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-600"/>Dùng thử VPS 3 ngày</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">Mỗi tài khoản được kích hoạt một lần duy nhất.</p>
      {trial.status === 'Active' ? <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm"><p className="font-bold">Đang dùng thử</p><p>Hết hạn: {trial.expiresAt ? new Date(trial.expiresAt).toLocaleString('vi-VN') : 'đang cập nhật'}</p></div> : <button type="button" onClick={startTrial} disabled={busy==='trial'||trial.status==='Expired'} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">{trial.status === 'Expired' ? 'Đã sử dụng chương trình' : 'Bắt đầu dùng thử'}</button>}
    </section>
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="font-bold flex items-center gap-2"><Clock3 className="w-5 h-5 text-violet-600"/>Lịch sử giá</h2>
      <p className="text-sm text-slate-500 mt-1 mb-3">Biến động giá gần nhất của gói cước.</p>
      <div className="h-32">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="date" fontSize={10}/><YAxis hide domain={['auto','auto']}/><Tooltip formatter={(value)=>Number(value ?? 0).toLocaleString('vi-VN')+'đ'}/><Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>:<div className="h-full flex items-center justify-center text-sm text-slate-400">Chưa có biến động giá</div>}</div>
    </section>
    <section className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="font-bold flex items-center gap-2"><MessageCircleQuestion className="w-5 h-5 text-blue-600"/>Hỏi & Đáp về gói cước</h2>
      <div className="flex gap-2 mt-4"><input value={question} onChange={event=>setQuestion(event.target.value)} maxLength={1000} placeholder="Bạn muốn hỏi gì về gói này?" className="flex-1 border rounded-lg px-3 py-2"/><button type="button" onClick={ask} disabled={!question.trim()||busy==='question'} className="px-4 bg-blue-600 text-white rounded-lg" title="Gửi câu hỏi"><Send className="w-5 h-5"/></button></div>
      {message && <p className="text-sm text-blue-700 mt-3">{message}</p>}
      <div className="mt-5 space-y-3">{questions.length===0?<p className="text-sm text-slate-500">Chưa có câu hỏi nào.</p>:questions.map(item=><article key={item.id} className="border rounded-lg p-4"><p className="font-semibold text-slate-900">{item.content}</p><p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p><div className="mt-3 space-y-2">{item.answers.map(answer=><div key={answer.id} className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm"><p>{answer.content}</p>{answer.isStaffAnswer&&<span className="text-xs font-bold text-blue-700">Đại diện CSKH</span>}</div>)}</div></article>)}</div>
    </section>
  </div>;
}
