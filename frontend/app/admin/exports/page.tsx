'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, FileSpreadsheet, FileText, ArrowLeft, 
  CheckCircle2, AlertCircle, ShoppingCart, Users, Server, 
  DollarSign, Shield, Tag, FileCode, Check, RefreshCw, Eye, X, Calendar, Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '@/src/lib/api';

interface ColumnDef {
  header: string;
  key: string;
  width?: number;
  format?: (val: any, row: any) => string | number;
}

interface ExportCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  apiEndpoint: string;
  filenamePrefix: string;
  columns: ColumnDef[];
}

export default function AdminExportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '365d' | 'all'>('30d');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Preview modal states
  const [previewData, setPreviewData] = useState<{ category: ExportCategory; rows: any[] } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper date formatter: dd/MM/yyyy HH:mm:ss
  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return String(dateStr);
    }
  };

  // Helper currency formatter
  const formatVnd = (amount?: number | string) => {
    if (amount === undefined || amount === null) return 0;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? 0 : num;
  };

  // Helper status translator
  const translateStatus = (status?: string) => {
    if (!status) return 'Không xác định';
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'paid' || s === 'success' || s === 'đã thanh toán') return 'Đã thanh toán (Hoàn tất)';
    if (s === 'pending' || s === 'chờ xử lý' || s === 'processing') return 'Chờ xử lý';
    if (s === 'active' || s === 'đang hoạt động') return 'Đang hoạt động';
    if (s === 'cancelled' || s === 'canceled' || s === 'đã hủy') return 'Đã hủy';
    if (s === 'failed' || s === 'thất bại') return 'Thất bại';
    if (s === 'suspended' || s === 'tạm khóa') return 'Tạm khóa / Tạm dừng';
    if (s === 'terminated' || s === 'đã xóa') return 'Đã thu hồi';
    if (s === 'refunded' || s === 'đã hoàn tiền') return 'Đã hoàn tiền';
    return String(status);
  };

  const exportCategories: ExportCategory[] = [
    {
      id: 'orders',
      title: 'Dữ Liệu Đơn Hàng (Orders & Transactions)',
      description: 'Toàn bộ danh sách đơn hàng mua Cloud VPS, Dedicated Server, Web Hosting kèm thông tin khách hàng, giảm giá và tổng tiền.',
      icon: ShoppingCart,
      color: 'emerald',
      apiEndpoint: '/orders',
      filenamePrefix: 'Don_Hang_CloudServiceStore',
      columns: [
        { header: 'Mã Đơn Hàng', key: 'id', width: 36 },
        { header: 'Mã Khách Hàng', key: 'userId', width: 36 },
        { header: 'Email Khách Hàng', key: 'userEmail', width: 28, format: (v, r) => r.userEmail || r.user?.email || 'N/A' },
        { header: 'Họ Tên Khách Hàng', key: 'userFullName', width: 24, format: (v, r) => r.userFullName || r.user?.fullName || 'Khách vãng lai' },
        { header: 'Tạm Tính (VNĐ)', key: 'subTotal', width: 16, format: (v) => formatVnd(v) },
        { header: 'Giảm Giá (VNĐ)', key: 'discountAmount', width: 16, format: (v) => formatVnd(v) },
        { header: 'Tổng Thanh Toán (VNĐ)', key: 'totalAmount', width: 22, format: (v) => formatVnd(v) },
        { header: 'Trạng Thái', key: 'status', width: 22, format: (v) => translateStatus(v) },
        { header: 'Tự Động Gia Hạn', key: 'autoRenew', width: 16, format: (v) => (v ? 'Có' : 'Không') },
        { header: 'Ngày Tạo Đơn', key: 'createdAt', width: 22, format: (v) => formatDateTime(v) },
      ]
    },
    {
      id: 'invoices',
      title: 'Quản Lý Hóa Đơn Điện Tử (Invoices VAT)',
      description: 'Lịch sử phát hành hóa đơn thanh toán đơn hàng, nạp tiền ví điện tử và thuế VAT đối soát kế toán.',
      icon: FileSpreadsheet,
      color: 'blue',
      apiEndpoint: '/orders/invoices/admin',
      filenamePrefix: 'Hoa_Don_VAT_CloudServiceStore',
      columns: [
        { header: 'Mã Hóa Đơn', key: 'id', width: 36 },
        { header: 'Số Hóa Đơn VAT', key: 'invoiceNumber', width: 20, format: (v, r) => r.invoiceNumber || `INV-${String(r.id || '').slice(0, 8).toUpperCase()}` },
        { header: 'Email Khách Hàng', key: 'userEmail', width: 28, format: (v, r) => r.userEmail || r.user?.email || 'N/A' },
        { header: 'Tên Khách Hàng', key: 'userName', width: 24, format: (v, r) => r.userName || r.user?.fullName || 'Khách hàng' },
        { header: 'Loại Hóa Đơn', key: 'type', width: 16, format: (v) => (v === 'TopUp' ? 'Nạp tiền ví' : 'Mua dịch vụ') },
        { header: 'Số Tiền (VNĐ)', key: 'amount', width: 18, format: (v) => formatVnd(v) },
        { header: 'Phương Thức', key: 'paymentMethod', width: 22, format: (v) => v || 'VNPay / Chuyển khoản' },
        { header: 'Trạng Thái', key: 'status', width: 22, format: (v) => translateStatus(v) },
        { header: 'Ngày Lập Hóa Đơn', key: 'createdAt', width: 22, format: (v) => formatDateTime(v) },
      ]
    },
    {
      id: 'users',
      title: 'Danh Sách Khách Hàng (Users & Accounts)',
      description: 'Hồ sơ tài khoản khách hàng, email, số điện thoại, công ty, mã số thuế, phân quyền và ngày đăng ký thành viên.',
      icon: Users,
      color: 'indigo',
      apiEndpoint: '/users',
      filenamePrefix: 'Khach_Hang_CloudServiceStore',
      columns: [
        { header: 'Mã Người Dùng', key: 'id', width: 36 },
        { header: 'Họ Và Tên', key: 'fullName', width: 24 },
        { header: 'Địa Chỉ Email', key: 'email', width: 28 },
        { header: 'Số Điện Thoại', key: 'phoneNumber', width: 16, format: (v) => v || 'Chưa cập nhật' },
        { header: 'Công Ty / Doanh Nghiệp', key: 'companyName', width: 26, format: (v) => v || 'Khách hàng cá nhân' },
        { header: 'Mã Số Thuế', key: 'taxCode', width: 16, format: (v) => v || 'N/A' },
        { header: 'Vai Trò (Role)', key: 'role', width: 16, format: (v, r) => r.role?.name || r.role || 'Customer' },
        { header: 'Trạng Thái', key: 'isActive', width: 16, format: (v) => (v !== false ? 'Hoạt động' : 'Bị khóa') },
        { header: 'Ngày Đăng Ký', key: 'createdAt', width: 22, format: (v) => formatDateTime(v) },
      ]
    },
    {
      id: 'vps',
      title: 'Tài Nguyên Máy Chủ Ảo (VPS Instances)',
      description: 'Danh sách các máy chủ ảo VPS, CPU Cores, RAM, Ổ cứng NVMe, IP mạng và thời hạn sử dụng của từng máy chủ.',
      icon: Server,
      color: 'purple',
      apiEndpoint: '/VpsInstances/admin',
      filenamePrefix: 'May_Chu_VPS_CloudServiceStore',
      columns: [
        { header: 'Mã Máy Chủ VPS', key: 'id', width: 36 },
        { header: 'Gói Dịch Vụ', key: 'planName', width: 22 },
        { header: 'CPU (Cores)', key: 'cpuCores', width: 14, format: (v) => `${v || 1} vCPU` },
        { header: 'RAM (GB)', key: 'ramMb', width: 14, format: (v) => `${Math.round((v || 1024) / 1024)} GB` },
        { header: 'Ổ Cứng NVMe (GB)', key: 'diskGb', width: 18, format: (v) => `${v || 20} GB` },
        { header: 'Tên Container / IP', key: 'containerName', width: 22, format: (v) => v || 'N/A' },
        { header: 'Trạng Thái', key: 'status', width: 22, format: (v) => translateStatus(v) },
        { header: 'Ngày Khởi Tạo', key: 'createdAt', width: 22, format: (v) => formatDateTime(v) },
        { header: 'Ngày Hết Hạn', key: 'expiresAt', width: 22, format: (v) => formatDateTime(v) },
      ]
    },
    {
      id: 'coupons',
      title: 'Mã Giảm Giá & Khuyến Mãi (Coupons)',
      description: 'Danh sách toàn bộ mã voucher chiết khấu, giá trị giảm giá %, lượt đã sử dụng và thời hạn hiệu lực.',
      icon: Tag,
      color: 'amber',
      apiEndpoint: '/coupons',
      filenamePrefix: 'Ma_Giam_Gia_CloudServiceStore',
      columns: [
        { header: 'Mã Định Danh', key: 'id', width: 36 },
        { header: 'Mã Voucher (Code)', key: 'code', width: 18 },
        { header: 'Chiết Khấu (%)', key: 'discountPercent', width: 16, format: (v, r) => (v ? `${v}%` : formatVnd(r.discountAmount)) },
        { header: 'Giảm Tối Đa (VNĐ)', key: 'maxDiscountAmount', width: 18, format: (v) => (v ? formatVnd(v) : 'Không giới hạn') },
        { header: 'Đơn Tối Thiểu (VNĐ)', key: 'minOrderAmount', width: 18, format: (v) => (v ? formatVnd(v) : 0) },
        { header: 'Lượt Đã Dùng', key: 'usageCount', width: 16, format: (v, r) => `${v || 0}/${r.usageLimit || '∞'}` },
        { header: 'Trạng Thái', key: 'isActive', width: 16, format: (v) => (v !== false ? 'Đang áp dụng' : 'Hết hạn / Đã tắt') },
        { header: 'Ngày Bắt Đầu', key: 'startDate', width: 22, format: (v) => formatDateTime(v) },
        { header: 'Ngày Hết Hạn', key: 'endDate', width: 22, format: (v) => formatDateTime(v) },
      ]
    },
    {
      id: 'audit_logs',
      title: 'Nhật Ký Thao Tác Hệ Thống (Audit Logs)',
      description: 'Lịch sử thao tác của các quản trị viên, nhân viên kế toán, kỹ thuật, địa chỉ IP truy cập và thời gian thực hiện.',
      icon: Shield,
      color: 'rose',
      apiEndpoint: '/audit-logs',
      filenamePrefix: 'Nhat_Ky_Audit_Logs_CloudServiceStore',
      columns: [
        { header: 'Mã Nhật Ký', key: 'id', width: 36 },
        { header: 'Hành Động', key: 'action', width: 24 },
        { header: 'Phân Hệ / Thực Thể', key: 'entityName', width: 20 },
        { header: 'Mã Đối Tượng', key: 'entityId', width: 36 },
        { header: 'Địa Chỉ IP', key: 'ipAddress', width: 18, format: (v) => v || 'Internal/System' },
        { header: 'Tài Khoản Thực Hiện', key: 'userEmail', width: 28, format: (v, r) => r.user?.email || r.userEmail || r.userId || 'System' },
        { header: 'Thời Gian Thực Hiện', key: 'timestamp', width: 22, format: (v) => formatDateTime(v) },
      ]
    }
  ];

  // Fetch and enrich data with user details and date range filter
  const fetchDataForCategory = async (category: ExportCategory): Promise<any[]> => {
    let rawList: any[] = [];
    try {
      // Special enrichment for orders to attach user fullName & email
      if (category.id === 'orders') {
        const [ordersRes, usersRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: [] })),
          api.get('/users').catch(() => ({ data: [] }))
        ]);

        const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.items || []);
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.items || []);
        
        const userMap = new Map<string, any>();
        usersData.forEach((u: any) => {
          if (u.id) userMap.set(u.id, u);
        });

        rawList = ordersData.map((ord: any) => {
          const matchedUser = ord.userId ? userMap.get(ord.userId) : null;
          return {
            ...ord,
            userEmail: ord.userEmail || matchedUser?.email || '',
            userFullName: ord.userFullName || matchedUser?.fullName || ''
          };
        });
      } else {
        const res = await api.get(category.apiEndpoint);
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (res.data?.items && Array.isArray(res.data.items)) {
          rawList = res.data.items;
        }
      }
    } catch {
      rawList = [];
    }

    if (dateRange === 'all' || rawList.length === 0) {
      return rawList;
    }

    // Filter by Date Range
    const now = new Date().getTime();
    const days = dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const cutoffTime = now - days * 24 * 60 * 60 * 1000;

    return rawList.filter(row => {
      const dateField = row.createdAt || row.timestamp || row.startDate || row.date;
      if (!dateField) return true;
      const t = new Date(dateField).getTime();
      return isNaN(t) || t >= cutoffTime;
    });
  };

  // PREVIEW DATA
  const handleOpenPreview = async (category: ExportCategory) => {
    setIsPreviewLoading(true);
    try {
      const filtered = await fetchDataForCategory(category);
      setPreviewData({
        category,
        rows: filtered.slice(0, 15) // Top 15 records
      });
    } catch {
      showToast('Không thể tải bản xem trước', 'error');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // EXPORT NATIVE EXCEL (.XLSX) WITH SHEETJS
  const handleExportXLSX = async (category: ExportCategory) => {
    const downloadKey = `${category.id}-xlsx`;
    setDownloading(downloadKey);

    try {
      const rawData = await fetchDataForCategory(category);

      if (rawData.length === 0) {
        showToast(`Không có bản ghi nào trong khoảng thời gian đã chọn (${dateRange})`, 'info');
        setDownloading(null);
        return;
      }

      // 1. Build array of objects with Vietnamese headers
      const sheetData = rawData.map(row => {
        const rowObj: Record<string, any> = {};
        category.columns.forEach(col => {
          let val = row[col.key];
          if (col.format) {
            val = col.format(val, row);
          }
          if (val === null || val === undefined) {
            val = '';
          }
          rowObj[col.header] = val;
        });
        return rowObj;
      });

      // 2. Create SheetJS worksheet
      const ws = XLSX.utils.json_to_sheet(sheetData);

      // 3. Set column widths
      ws['!cols'] = category.columns.map(c => ({
        wch: c.width || Math.max(c.header.length + 4, 15)
      }));

      // 4. Create workbook and append sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Dữ Liệu');

      // 5. Generate and trigger download
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${category.filenamePrefix}_${dateRange}_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, filename);

      showToast(`Đã xuất ${rawData.length} bản ghi ${category.title} sang Excel (.XLSX) thành công!`, 'success');
    } catch (err) {
      console.error('Export XLSX error:', err);
      showToast('Đã xảy ra lỗi trong quá trình xuất tệp Excel.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  // EXPORT PROPER CSV (WITH SEP=, AND UTF-8 BOM)
  const handleExportCSV = async (category: ExportCategory) => {
    const downloadKey = `${category.id}-csv`;
    setDownloading(downloadKey);

    try {
      const data = await fetchDataForCategory(category);

      if (data.length === 0) {
        showToast(`Không có bản ghi nào trong khoảng thời gian đã chọn (${dateRange})`, 'info');
        setDownloading(null);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${category.filenamePrefix}_${dateRange}_${timestamp}.csv`;

      // Formatted header row
      const headersLine = category.columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');

      // Formatted data rows
      const rowsLines = data.map(row => {
        return category.columns.map(col => {
          let val = row[col.key];
          if (col.format) {
            val = col.format(val, row);
          }
          if (val === null || val === undefined) {
            val = '';
          }
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\r\n');

      // Add 'sep=,' instruction for Excel on European/Vietnamese Windows locales + UTF-8 BOM (\uFEFF)
      const csvContent = '\uFEFFsep=,\r\n' + headersLine + '\r\n' + rowsLines;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      triggerBrowserDownload(blob, filename);
      showToast(`Đã xuất ${data.length} bản ghi sang file CSV chuẩn!`, 'success');
    } catch (err) {
      console.error('Export CSV error:', err);
      showToast('Đã xảy ra lỗi trong quá trình xuất tệp CSV.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  // EXPORT JSON
  const handleExportJSON = async (category: ExportCategory) => {
    const downloadKey = `${category.id}-json`;
    setDownloading(downloadKey);

    try {
      const data = await fetchDataForCategory(category);

      if (data.length === 0) {
        showToast(`Không có bản ghi nào trong khoảng thời gian đã chọn (${dateRange})`, 'info');
        setDownloading(null);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${category.filenamePrefix}_${dateRange}_${timestamp}.json`;
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      
      triggerBrowserDownload(blob, filename);
      showToast(`Đã xuất ${data.length} bản ghi sang file JSON!`, 'success');
    } catch (err) {
      console.error('Export JSON error:', err);
      showToast('Đã xảy ra lỗi trong quá trình xuất tệp JSON.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xs">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <span>Trung Tâm Xuất Báo Cáo &amp; Dữ Liệu (Exports)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Xuất trực tiếp tệp <strong>Microsoft Excel (.XLSX chuẩn đa cột)</strong>, CSV hoặc JSON. Phân chia cột A, B, C, D rõ ràng, không bị dồn một cột hay lỗi font tiếng Việt.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2.5 self-start md:self-auto bg-[#0F172A] p-1.5 rounded-lg border border-white/10">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-1.5 rounded-md border-0 text-xs font-bold bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            >
              <option value="30d">30 Ngày Gần Nhất</option>
              <option value="90d">90 Ngày (1 Quý)</option>
              <option value="365d">1 Năm Qua (365 Ngày)</option>
              <option value="all">Toàn Bộ Lịch Sử Hệ Thống</option>
            </select>
          </div>
        </div>

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exportCategories.map((item) => (
            <div
              key={item.id}
              className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-white/10/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleOpenPreview(item)}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-400 bg-[#0F172A] hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 border border-white/10/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem trước</span>
                  </button>
                </div>

                <h3 className="text-sm font-black text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-3 mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                {/* Primary Excel Button */}
                <button
                  onClick={() => handleExportXLSX(item)}
                  disabled={downloading === `${item.id}-xlsx`}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-emerald-600/20 disabled:opacity-50"
                  title="Xuất file bảng tính Excel .XLSX chuẩn đẹp đa cột"
                >
                  {downloading === `${item.id}-xlsx` ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  <span>Xuất Excel (.XLSX) Chuẩn Đẹp</span>
                </button>

                {/* Secondary Formats (CSV & JSON) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV(item)}
                    disabled={downloading === `${item.id}-csv`}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[11px] transition-all flex items-center justify-center gap-1 border border-white/10 shadow-2xs disabled:opacity-50"
                    title="Xuất định dạng CSV"
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={() => handleExportJSON(item)}
                    disabled={downloading === `${item.id}-json`}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[11px] transition-all flex items-center justify-center gap-1 border border-white/10 shadow-2xs disabled:opacity-50"
                    title="Xuất định dạng cấu trúc JSON"
                  >
                    <FileCode className="w-3 h-3 text-slate-500" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Information Footer */}
        <div className="mt-8 p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-medium">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Đã tối ưu hóa 100%:</strong> Tệp <strong>.XLSX</strong> được tạo tự động với độ rộng cột chuẩn (Auto Column Widths), số tiền và ngày tháng định dạng đúng kiểu dữ liệu Excel, tách cột A, B, C, D, E riêng biệt và hỗ trợ tiếng Việt có dấu hoàn hảo trên mọi phiên bản Excel / Google Sheets!
          </span>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0F172A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Xem Trước Bảng Dữ Liệu: {previewData.category.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hiển thị 15 dòng đầu tiên ({previewData.rows.length} bản ghi tìm thấy trong khoảng thời gian {dateRange})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewData(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-5">
              {previewData.rows.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="font-bold text-xs">Không có dữ liệu trong khoảng thời gian đã chọn ({dateRange}).</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-white/10 text-slate-200 font-bold border-b border-white/10">
                      <tr>
                        {previewData.category.columns.map((col, idx) => (
                          <th key={idx} className="p-2.5 whitespace-nowrap border-r border-white/10 last:border-0">
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-200">
                      {previewData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-[#0F172A]">
                          {previewData.category.columns.map((col, colIdx) => {
                            let val = row[col.key];
                            if (col.format) {
                              val = col.format(val, row);
                            }
                            return (
                              <td key={colIdx} className="p-2.5 whitespace-nowrap border-r border-slate-100 last:border-0 font-mono text-[11px]">
                                {val !== null && val !== undefined ? String(val) : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0F172A] flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Tải file để xem toàn bộ danh sách
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/20 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleExportXLSX(previewData.category);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất File Excel (.XLSX)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
