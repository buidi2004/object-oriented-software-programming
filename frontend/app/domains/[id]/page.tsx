'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Plus, Trash2, Edit2, Save, X, 
  Copy, CheckCircle2, AlertCircle, Settings, ShieldCheck, Clock
} from 'lucide-react';

interface DnsRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

interface Domain {
  id: string;
  name: string;
  expiryDate: string;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'pending';
  nameservers: string[];
  dnsRecords: DnsRecord[];
}

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: 'A' as DnsRecord['type'],
    name: '',
    value: '',
    ttl: 3600,
    priority: undefined as number | undefined
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDomain(token);
  }, [domainId, router]);

  const fetchDomain = async (token: string) => {
    try {
      const [domainRes, dnsRes] = await Promise.all([
        fetch(`/api/domains/${domainId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/domains/${domainId}/dns`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (domainRes.ok) {
        const data = await domainRes.json();
        const dnsRecords = dnsRes.ok ? await dnsRes.json() : [];
        setDomain({
          id: data.id,
          name: data.name,
          expiryDate: data.expiryDate,
          autoRenew: data.autoRenew,
          status: data.status,
          nameservers: [],
          dnsRecords: (dnsRecords || []).map((r: any) => ({
            id: r.id,
            type: r.type,
            name: r.name,
            value: r.value,
            ttl: r.ttl,
            priority: r.priority,
          })),
        });
      }
    } catch (error) {
      console.error('Failed to fetch domain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDnsRecord = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/domains/${domainId}/dns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRecord),
      });
      if (response.ok) {
        setShowAddRecord(false);
        fetchDomain(token!);
      }
    } catch (error) {
      console.error('Failed to add DNS record:', error);
    }
  };

  const handleDeleteDnsRecord = async (recordId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/domains/${domainId}/dns/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDomain(token!);
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-blue-100 text-blue-700';
      case 'AAAA': return 'bg-purple-100 text-purple-700';
      case 'CNAME': return 'bg-green-100 text-green-700';
      case 'MX': return 'bg-yellow-100 text-yellow-700';
      case 'TXT': return 'bg-slate-100 text-slate-700';
      case 'NS': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Domain not found</h2>
          <Link href="/domains" className="text-blue-600 hover:underline">
            ← Back to My Domains
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/domains" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách tên miền
          </Link>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt
            </button>
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors">
              Gia hạn ngay
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-slate-900 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Globe className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black">{domain.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    domain.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                    domain.status === 'expired' ? 'bg-red-500/20 text-red-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {domain.status === 'active' ? 'Đang hoạt động' : 
                     domain.status === 'expired' ? 'Đã hết hạn' : 'Chờ xác thực'}
                  </span>
                  <span className="text-sm text-slate-600">
                    Hết hạn: {new Date(domain.expiryDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Bảo vệ WHOIS Privacy
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                Auto-renew: {domain.autoRenew ? 'Bật' : 'Tắt'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - DNS Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nameservers */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Nameservers
                </h2>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Sửa
                </button>
              </div>
              <div className="space-y-2">
                {domain.nameservers.map((ns, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-mono text-sm text-slate-700">{ns}</span>
                    <button
                      onClick={() => copyToClipboard(ns)}
                      className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* DNS Records */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Bản ghi DNS ({domain.dnsRecords.length})
                </h2>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm bản ghi
                </button>
              </div>

              {showAddRecord && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Thêm bản ghi DNS mới</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Loại</label>
                      <select
                        value={newRecord.type}
                        onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as DnsRecord['type'] })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="A">A</option>
                        <option value="AAAA">AAAA</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                        <option value="NS">NS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tên</label>
                      <input
                        type="text"
                        value={newRecord.name}
                        onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                        placeholder="@ hoặc www"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị</label>
                      <input
                        type="text"
                        value={newRecord.value}
                        onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                        placeholder="IP hoặc hostname"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">TTL (giây)</label>
                      <input
                        type="number"
                        value={newRecord.ttl}
                        onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddDnsRecord}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Lưu bản ghi
                    </button>
                    <button
                      onClick={() => setShowAddRecord(false)}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {domain.dnsRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Settings className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="font-medium">Chưa có bản ghi DNS nào</p>
                  <p className="text-sm mt-1">Thêm bản ghi để cấu hình tên miền</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Loại</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Tên</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Giá trị</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">TTL</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domain.dnsRecords.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTypeColor(record.type)}`}>
                              {record.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{record.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{record.value}</td>
                          <td className="py-3 px-4 text-slate-500">{record.ttl}s</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(`${record.name} ${record.ttl} ${record.type} ${record.value}`)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                title="Sao chép"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDnsRecord(record.id)}
                                className="p-1.5 text-slate-600 hover:text-red-600 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Domain Actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Thao tác với tên miền</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Gia hạn', icon: Clock, color: 'blue' },
                  { label: 'Chuyển nhượng', icon: Globe, color: 'indigo' },
                  { label: 'Đổi NS', icon: Settings, color: 'emerald' },
                  { label: 'Khoá tên miền', icon: ShieldCheck, color: 'amber' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                    <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Domain Info */}
          <div className="space-y-6">
            {/* Registration Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Thông tin đăng ký</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày đăng ký</span>
                  <span className="font-semibold text-slate-900">01/01/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày hết hạn</span>
                  <span className="font-semibold text-slate-900">01/01/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ sở hữu</span>
                  <span className="font-semibold text-slate-900">Nguyễn Văn A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="font-semibold text-emerald-600">Hoạt động</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Liên kết nhanh</h3>
              <div className="space-y-2">
                {[
                  { label: 'Quản lý DNS', href: '#' },
                  { label: 'Cài đặt email forwards', href: '#' },
                  { label: 'SSL Certificate', href: '#' },
                  { label: 'Redirections', href: '#' },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-slate-900">
              <h3 className="font-bold text-lg mb-2">Cần hỗ trợ?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Đội ngũ kỹ thuật sẵn sàng hỗ trợ bạn 24/7
              </p>
              <Link
                href="/tickets"
                className="block w-full py-3 rounded-xl bg-white text-blue-600 font-bold text-sm text-center hover:bg-blue-50 transition-colors"
              >
                Tạo ticket hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
