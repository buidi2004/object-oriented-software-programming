'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Shield, ArrowRight, Loader, Download, Copy, Lock, 
  Info, RefreshCw, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface SslCertItem {
  id: string;
  domainName?: string;
  domain?: { name: string };
  certificate?: string;
  privateKey?: string;
  csr?: string;
  issuer?: string;
  status: string;
  failureReason?: string;
  expiryDate?: string;
  createdAt: string;
}

export default function SslCertificatesPage() {
  const [certificates, setCertificates] = useState<SslCertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/ssl');
      setCertificates(res.data || []);
    } catch (error) {
      console.warn('Error fetching SSL certificates', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              Quản Lý SSL / TLS Certificates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Chứng chỉ SSL bảo mật 100% qua giao thức ACME Let's Encrypt, tự động xác thực HTTP-01 và gia hạn định kỳ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCertificates}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/services/ssl-certificates"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Yêu Cầu Cấp SSL Mới
            </Link>
          </div>
        </div>

        {isLoading && certificates.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có chứng chỉ SSL nào</h3>
            <p className="text-slate-500 mb-6 text-xs sm:text-sm">Tăng cường uy tín và mã hóa HTTPS cho tên miền của bạn ngay hôm nay.</p>
            <Link href="/services/ssl-certificates" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700">
              Khám phá dịch vụ SSL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <SslCertificateCard key={cert.id} cert={cert} onRefresh={fetchCertificates} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SslCertificateCard({ cert, onRefresh }: { cert: SslCertItem; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'SslCertificate',
    cert.id,
    cert.certificate ? 'Active' : (cert.status || 'Provisioning')
  );

  const domainName = cert.domainName || cert.domain?.name || 'Tên miền chưa xác định';
  const isIssued = status === 'Active' || status === 'Running' || Boolean(cert.certificate);

  const downloadPem = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        status === 'Failed' ? 'bg-rose-500' : isIssued ? 'bg-emerald-500' : 'bg-amber-500'
      }`}></div>

      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isIssued ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">{domainName}</h3>
              <p className="text-xs text-slate-500 font-mono">
                Issuer: {cert.issuer || "Let's Encrypt (ACME v2)"}
              </p>
            </div>
          </div>
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
        </div>

        {/* Slow Warning Banner */}
        {isSlow && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{slowWarningText}</span>
          </div>
        )}

        {/* Failed Alert */}
        {status === 'Failed' && (
          <div className="mb-4">
            <ResourceFailureAlert
              resourceName={`Chứng chỉ ${domainName}`}
              onRetry={onRefresh}
              supportHref="/dashboard/tickets"
            />
          </div>
        )}

        {isIssued ? (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Ngày phát hành</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {new Date(cert.createdAt || Date.now()).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Hạn chứng chỉ (90 ngày)</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('vi-VN') : '90 ngày kể từ ngày cấp'}
              </p>
            </div>

            <div className="col-span-2 flex gap-2 mt-2">
              <button
                onClick={() => downloadPem(cert.certificate || '-----BEGIN CERTIFICATE-----\n...', `${domainName}-fullchain.pem`)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Fullchain.pem
              </button>
              <button
                onClick={() => downloadPem(cert.privateKey || '-----BEGIN RSA PRIVATE KEY-----\n...', `${domainName}-privkey.pem`)}
                className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Privkey.pem
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl mt-2 text-xs">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Đang thực hiện HTTP-01 Challenge</p>
              <p className="text-amber-800 mt-0.5 text-[11px]">
                Hệ thống đang tự động xác thực quyền sở hữu tên miền qua máy chủ ACME Let's Encrypt.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
