'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { requestAuth } from '@/src/lib/authNavigation';
import { ArrowLeft, FileText, Download, AlertCircle, Loader, Calendar, DollarSign } from 'lucide-react';

interface InvoiceDetail {
  id: string;
  orderId: string;
  invoiceNumber: string;
  issuedAt: string;
  pdfUrl: string;
  amount: number;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  const fetchInvoice = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      requestAuth('login', '/dashboard/invoices/' + orderId);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInvoice(await res.json());
      } else if (res.status === 404) {
        setError('Chưa có hóa đơn cho đơn hàng này.');
      } else {
        setError('Không thể tải hóa đơn.');
      }
    } catch {
      setError('Không thể tải hóa đơn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInvoice();
      }
    } catch {
      setError('Không thể tạo hóa đơn.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Chi tiết hóa đơn</h1>
          <p className="text-slate-500 mt-1">Đơn hàng #{orderId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={handleGenerate} className="ml-auto px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-semibold">
            Tạo hóa đơn
          </button>
        </div>
      )}

      {invoice && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{invoice.invoiceNumber}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {invoice.amount.toLocaleString('vi-VN')}₫
            </p>
          </div>

          {invoice.pdfUrl && (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm"
            >
              <Download className="w-4 h-4" /> Tải PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
