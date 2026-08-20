'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Shield, ArrowRight, Loader, Download, Copy, Lock, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PinServiceButton } from '@/src/components/team-features/PinServiceButton';
import { useResourceProvisioning } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

export default function SslCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/ssl', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error fetching SSL certificates', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Quản lý SSL Certificates</h1>
            <p className="text-slate-500 mt-1">Bảo vệ website của bạn với chứng chỉ bảo mật</p>
          </div>
          <Link href="/services/ssl-certificates" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Mua thêm SSL
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có chứng chỉ SSL nào</h3>
            <p className="text-slate-500 mb-6">Tăng cường uy tín và bảo mật cho website của bạn ngay hôm nay.</p>
            <Link href="/services/ssl-certificates" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
              Khám phá dịch vụ SSL <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <SslCertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SslCertificateCard({ cert }: { cert: any }) {
  const status = useResourceProvisioning('SslCertificate', cert.id, cert.certificate ? 'Issued' : 'Pending');
  const isPending = status === 'Provisioning' || status === 'Pending';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào clipboard!');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPending ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{cert.domain?.name || 'Unknown Domain'}</h3>
            <p className="text-sm text-slate-500">ID: {cert.id.substring(0, 8)}...</p>
          </div>
        </div>
        <ProvisioningStatusBadge status={isPending ? 'Provisioning' : 'Running'} />
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">CSR (Certificate Signing Request)</span>
          <button onClick={() => copyToClipboard(cert.csr)} className="text-slate-400 hover:text-blue-600 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <pre className="text-[10px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 overflow-x-auto max-h-24">
          {cert.csr}
        </pre>
      </div>

      {!isPending ? (
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Ngày phát hành</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(cert.createdAt || Date.now()).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Ngày hết hạn</p>
            <p className="text-sm font-semibold text-slate-900">
              {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
            </p>
          </div>
          <div className="col-span-2 flex gap-2 mt-2">
            <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Tải Certificate
            </button>
            <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Tải Private Key
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl mt-4">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Đang chờ nhà cung cấp cấp phát</p>
            <p className="text-xs text-amber-700 mt-1">Vui lòng cấu hình DNS để xác thực quyền sở hữu tên miền. Chứng chỉ sẽ được cấp sau khi xác thực thành công.</p>
          </div>
        </div>
      )}

      <Link href={`/dashboard/ssl-certificates/${cert.id}`} className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
        Xem chi tiết <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
