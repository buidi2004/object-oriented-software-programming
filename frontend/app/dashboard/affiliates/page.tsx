'use client';

import { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import { Share2, Link as LinkIcon, Check, Copy, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function AffiliatesPage() {
  const [loading, setLoading] = useState(true);
  
  // Referral Code State
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Apply Referral Code State
  const [applyCode, setApplyCode] = useState('');
  const [applyStatus, setApplyStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Affiliate Application State
  const [application, setApplication] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [commissionRate, setCommissionRate] = useState(10); // Default 10%
  const [appStatus, setAppStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch referral code
      const refRes = await api.get('/referrals/me');
      setMyReferralCode(refRes.data.code);

      // Fetch affiliate application status
      try {
        const appRes = await api.get('/affiliate-applications/me');
        setApplication(appRes.data);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error("Lỗi khi tải đơn đăng ký:", err);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu affiliate:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (myReferralCode) {
      navigator.clipboard.writeText(myReferralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyStatus(null);
    if (!applyCode.trim()) return;

    try {
      await api.post('/referrals/apply', { code: applyCode.trim() });
      setApplyStatus({ type: 'success', message: 'Áp dụng mã giới thiệu thành công!' });
      setApplyCode('');
    } catch (err: any) {
      setApplyStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Không thể áp dụng mã này (có thể đã áp dụng hoặc mã không hợp lệ).' 
      });
    }
  };

  const handleApplyAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppStatus(null);
    if (!companyName.trim()) return;

    try {
      await api.post('/affiliate-applications', {
        companyName,
        commissionRate
      });
      setAppStatus({ type: 'success', message: 'Đăng ký thành công! Vui lòng chờ quản trị viên duyệt.' });
      fetchData(); // Refresh to get the new application
    } catch (err: any) {
      setAppStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Lỗi khi gửi đơn đăng ký.' 
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex justify-center items-center h-64">
        <div className="flex items-center gap-2 text-[#1F1F1F]">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Share2 className="w-8 h-8 text-[#1F1F1F]" />
          Tiếp thị Liên kết (Affiliates)
        </h1>
        <p className="text-gray-500 mt-2">Chia sẻ mã giới thiệu của bạn và đăng ký trở thành đối tác để nhận hoa hồng hấp dẫn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Your Referral Code */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-[#1F1F1F]" />
            Mã Giới Thiệu Của Bạn
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Gửi mã này cho bạn bè khi họ đăng ký tài khoản để cả hai cùng nhận được ưu đãi từ hệ thống.
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-sm p-3 text-center">
              <span className="font-mono text-xl font-bold tracking-wider text-[#1F1F1F]">
                {myReferralCode || '----'}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              disabled={!myReferralCode}
              className={`p-3 rounded-sm transition-colors flex items-center justify-center shrink-0 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-[#1F1F1F] hover:bg-indigo-100'
              }`}
              title="Sao chép"
            >
              {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-2 text-center font-medium animate-in fade-in">
              Đã sao chép vào bộ nhớ tạm!
            </p>
          )}
        </div>

        {/* Apply Referral Code */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nhập Mã Giới Thiệu</h2>
          <p className="text-sm text-gray-500 mb-6">
            Bạn có mã giới thiệu từ người khác? Hãy nhập vào đây để nhận ưu đãi ngay lập tức.
          </p>
          
          <form onSubmit={handleApplyCode} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value)}
                placeholder="Ví dụ: REF-ABCDEF"
                className="flex-1 border border-gray-300 rounded-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={!applyCode.trim()}
                className="bg-white hover:bg-gray-800 text-slate-900 px-6 py-2.5 rounded-sm font-medium transition-colors disabled:opacity-50"
              >
                Áp dụng
              </button>
            </div>
            {applyStatus && (
              <div className={`p-3 rounded-sm text-sm flex items-start gap-2 ${
                applyStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {applyStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {applyStatus.message}
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Affiliate Application */}
      <div className="bg-white rounded shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Chương trình Đối tác Affiliate</h2>
        
        {application && application.status === 'Approved' ? (
          <div className="bg-green-50 border border-green-200 rounded p-6 mt-6 flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-1">Bạn đã là Đối tác chính thức!</h3>
              <p className="text-green-800 mb-2">Đơn đăng ký cho công ty <strong>{application.companyName}</strong> đã được phê duyệt.</p>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border border-green-200 font-medium text-green-700 text-sm">
                Mức hoa hồng của bạn: <span className="text-xl">{application.commissionRate}%</span>
              </div>
            </div>
          </div>
        ) : application && application.status === 'Pending' ? (
          <div className="bg-amber-50 border border-amber-200 rounded p-6 mt-6 flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">Đơn đăng ký đang chờ duyệt</h3>
              <p className="text-amber-800">
                Chúng tôi đã nhận được yêu cầu đăng ký cho <strong>{application.companyName}</strong> (Mức hoa hồng: {application.commissionRate}%). Vui lòng chờ quản trị viên xem xét và phản hồi trong thời gian sớm nhất.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-gray-500 mb-6 max-w-3xl">
              Trở thành đối tác kinh doanh cùng chúng tôi. Bạn sẽ nhận được hoa hồng định kỳ dựa trên doanh số mang lại từ các khách hàng bạn giới thiệu thông qua mã giới thiệu bên trên.
            </p>
            
            {application && application.status === 'Rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6 flex items-center gap-3 text-red-800">
                <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                Đơn đăng ký trước đó của bạn đã bị từ chối. Bạn có thể thử gửi lại thông tin mới bên dưới.
              </div>
            )}

            <form onSubmit={handleApplyAffiliate} className="max-w-xl space-y-5 bg-gray-50 p-6 rounded border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Công ty / Tổ chức của bạn *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nhập tên thương hiệu, website hoặc tổ chức"
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức hoa hồng đề xuất (%) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-sm appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="w-16 text-center font-bold text-lg text-[#1F1F1F] bg-white border border-gray-200 rounded-sm py-1">
                    {commissionRate}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Thường dao động từ 10% đến 30% tùy vào quy mô đối tác.</p>
              </div>

              {appStatus && (
                <div className={`p-3 rounded-sm text-sm flex items-start gap-2 ${
                  appStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {appStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {appStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-sm font-medium transition-colors mt-4"
              >
                Gửi Đăng Ký Đối Tác
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
