'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestAuth } from '@/src/lib/authNavigation';
import { ArrowLeft, ShieldCheck, Lock, Copy, Download, Loader, AlertCircle } from 'lucide-react';

export default function SslCertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const certId = params.id as string;
  const [cert, setCert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [certId]);

  const fetchCertificate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      requestAuth('login', '/dashboard/ssl-certificates/' + certId);
      return;
    }

    try {
      const res = await fetch(`/api/ssl/${certId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCert(await res.json());
      } else {
        setError('Không tìm thấy chứng chỉ SSL.');
      }
    } catch {
      setError('Không thể tải chứng chỉ SSL.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <p className="text-slate-600">{error || 'Không tìm thấy chứng chỉ'}</p>
        <Link href="/dashboard/ssl-certificates" className="inline-block mt-4 text-[#1F1F1F] font-semibold">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/ssl-certificates" className="p-2 rounded-sm hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Chi tiết SSL Certificate</h1>
          <p className="text-slate-600 mt-1">{cert.domain?.name || cert.domainName || 'Chứng chỉ SSL'}</p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">{cert.domain?.name || cert.domainName}</h2>
              <p className="text-sm text-slate-600 font-mono">ID: {cert.id}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cert.certificate ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {cert.certificate ? 'Active' : 'Pending'}
          </span>
        </div>

        {cert.csr && (
          <div className="bg-slate-50 rounded p-4 mb-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">CSR</span>
              <button onClick={() => copyToClipboard(cert.csr)} className="text-slate-600 hover:text-[#1F1F1F]">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-[10px] text-slate-600 font-mono bg-white p-2 rounded border overflow-x-auto max-h-32">{cert.csr}</pre>
          </div>
        )}

        {cert.certificate && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Ngày hết hạn</p>
              <p className="text-sm font-semibold">{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
            <div className="col-span-2 flex gap-2 mt-2">
              <button className="flex-1 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-sm text-sm font-bold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Tải Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
