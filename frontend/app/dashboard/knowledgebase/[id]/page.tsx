'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Terminal, Shield, HardDrive, RefreshCw, 
  Copy, Check, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle,
  Server, Lock, Key, Cpu, Zap, ExternalLink, Globe, Layers, Download
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  updatedAt: string;
  author: string;
  summary: string;
  content: React.ReactNode;
}

export default function KnowledgebaseDetailPage() {
  const params = useParams();
  const id = (params.id as string) || 'ssh-guide';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const articles: Record<string, Article> = {
    'ssh-guide': {
      id: 'ssh-guide',
      title: 'Hướng dẫn toàn diện kết nối SSH vào máy chủ VPS Linux',
      category: 'Quản trị Máy chủ',
      readTime: '6 phút đọc',
      updatedAt: '22/08/2026',
      author: 'Đội ngũ Kỹ thuật AZVPS',
      summary: 'Tài liệu hướng dẫn từng bước kết nối và quản trị dòng lệnh Linux qua Terminal Web, MobaXterm, PuTTY, và VS Code Remote SSH.',
      content: (
        <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* Intro callout */}
          <div className="p-4 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl text-[#1F1F1F]">
            <p className="font-semibold text-xs sm:text-sm">
              💡 <strong>SSH (Secure Shell)</strong> là giao thức mạng mật mã được sử dụng rộng rãi nhất để vận hành các dịch vụ mạng một cách an toàn qua một mạng không an toàn. Tất cả máy chủ VPS tại hệ thống đều được kích hoạt sẵn SSH Port 22 với quyền Root.
            </p>
          </div>

          {/* Section 1: Web Terminal */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Cách 1: Sử dụng Web Terminal tích hợp trực tiếp (Khuyên dùng - 1 Click)
            </h2>
            <p>
              Bạn không cần cài đặt bất kỳ phần mềm nào vào máy tính. Ngay trên giao diện quản trị VPS của hệ thống, chúng tôi đã tích hợp sẵn <strong>Web Terminal Realtime</strong> kết nối trực tiếp qua SignalR WebSocket.
            </p>

            {/* Visual Illustration of Web Terminal */}
            <div className="bg-white text-slate-900 rounded overflow-hidden shadow-lg border border-slate-200 my-4">
              <div className="bg-white px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-slate-700">root@azvps-1786899581:~# Web Terminal</span>
                </div>
                <span className="text-emerald-400 font-mono text-[10px]">🟢 Live Connected</span>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400 space-y-1 bg-slate-50">
                <p>Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-40-generic x86_64)</p>
                <p className="text-slate-600"> * Documentation:  https://help.ubuntu.com</p>
                <p className="text-slate-600"> * Management:     https://landscape.canonical.com</p>
                <p className="pt-2 text-slate-900">root@azvps-1786899581:~# <span className="text-emerald-400">uname -a</span></p>
                <p className="text-slate-700">Linux azvps-1786899581 6.8.0 #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</p>
                <p className="text-slate-900">root@azvps-1786899581:~# <span className="animate-pulse">_</span></p>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Truy cập vào menu <strong><Link href="/dashboard/vps-instances" className="text-[#1F1F1F] underline">Quản lý VPS</Link></strong>.</li>
              <li>Tại Tab <strong>Overview</strong>, kéo xuống dưới để thấy khung terminal gõ lệnh trực tiếp.</li>
              <li>Hoặc bấm nút <strong>[ 💻 Terminal ]</strong> ở thanh công cụ đầu trang để mở giao diện toàn màn hình.</li>
            </ol>
          </section>

          {/* Section 2: SSH Client (Windows / Mac / Linux) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Cách 2: Kết nối bằng Terminal máy tính (macOS, Linux, Windows 10/11)
            </h2>
            <p>
              Mở ứng dụng <strong>Command Prompt</strong>, <strong>PowerShell</strong> hoặc <strong>Terminal</strong> trên máy của bạn và chạy dòng lệnh sau:
            </p>

            <div className="relative bg-white text-emerald-400 font-mono text-xs p-4 rounded border border-slate-200 flex items-center justify-between">
              <code>ssh root@203.145.46.200 -p 22</code>
              <button
                onClick={() => handleCopy('ssh root@203.145.46.200 -p 22', 'cmd1')}
                className="text-slate-600 hover:text-slate-900 px-2 py-1 bg-white rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedCode === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'cmd1' ? 'Đã sao chép' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Các bước đăng nhập:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Bước 1:</strong> Nếu là lần đầu kết nối, hệ thống sẽ hỏi: <em>&quot;Are you sure you want to continue connecting (yes/no/[fingerprint])?&quot;</em>. Hãy gõ <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">yes</code> rồi nhấn Enter.</li>
                <li><strong>Bước 2:</strong> Nhập <strong>Mật khẩu Root</strong> đã được cung cấp (Lưu ý: Khi gõ mật khẩu trên Linux, màn hình sẽ không hiện ký tự để bảo mật, bạn cứ dán hoặc gõ chính xác rồi Enter).</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Using MobaXterm or PuTTY */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Cách 3: Sử dụng phần mềm chuyên dụng (MobaXterm / PuTTY)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div className="p-4 bg-white border border-slate-200 rounded shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Terminal className="w-5 h-5 text-[#1F1F1F]" /> MobaXterm (Khuyên Dùng)
                </div>
                <p className="text-xs text-slate-600">
                  Tích hợp sẵn quản lý File SFTP kéo thả, hỗ trợ nhiều tab và tự động lưu mật khẩu phiên làm việc.
                </p>
                <ol className="text-xs list-decimal list-inside space-y-1 text-slate-600 pt-1">
                  <li>Nhấn <strong>Session</strong> &gt; Chọn <strong>SSH</strong>.</li>
                  <li><strong>Remote host:</strong> Nhập IP VPS (ví dụ: <code className="font-mono text-[#1F1F1F]">203.145.46.200</code>).</li>
                  <li>Tích chọn <strong>Specify username</strong> và nhập <code className="font-mono text-[#1F1F1F]">root</code>.</li>
                  <li><strong>Port:</strong> <code className="font-mono">22</code>. Nhấn <strong>OK</strong>.</li>
                </ol>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Shield className="w-5 h-5 text-emerald-600" /> PuTTY (Nhẹ &amp; Nhanh)
                </div>
                <p className="text-xs text-slate-600">
                  Phần mềm nhỏ gọn kinh điển dành riêng cho hệ điều hành Windows.
                </p>
                <ol className="text-xs list-decimal list-inside space-y-1 text-slate-600 pt-1">
                  <li>Mở <strong>PuTTY</strong>.</li>
                  <li>Tại ô <strong>Host Name (or IP address)</strong>: Nhập IP VPS.</li>
                  <li><strong>Port:</strong> Nhập <code className="font-mono">22</code>, Connection type chọn <strong>SSH</strong>.</li>
                  <li>Nhấn <strong>Open</strong> và nhập tài khoản <code className="font-mono">root</code> + Mật khẩu.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 4: Basic Linux Commands Cheat Sheet */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Bảng tra cứu lệnh Linux cơ bản hữu ích
            </h2>

            <div className="overflow-x-auto rounded border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Lệnh (Command)</th>
                    <th className="py-2.5 px-4">Mục đích sử dụng</th>
                    <th className="py-2.5 px-4">Ví dụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#1F1F1F]">htop / top</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Kiểm tra CPU, RAM và tiến trình realtime</td>
                    <td className="py-2.5 px-4 text-slate-600">htop</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#1F1F1F]">df -h</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Kiểm tra dung lượng ổ cứng NVMe còn trống</td>
                    <td className="py-2.5 px-4 text-slate-600">df -h /</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#1F1F1F]">free -m</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Kiểm tra dung lượng RAM đang sử dụng theo MB</td>
                    <td className="py-2.5 px-4 text-slate-600">free -h</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#1F1F1F]">ufw status</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Kiểm tra các Port đang được mở tường lửa</td>
                    <td className="py-2.5 px-4 text-slate-600">ufw allow 80/tcp</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#1F1F1F]">passwd</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Đổi mật khẩu Root trực tiếp bằng dòng lệnh</td>
                    <td className="py-2.5 px-4 text-slate-600">passwd</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    },

    'reinstall-os': {
      id: 'reinstall-os',
      title: 'Hướng dẫn cài đặt lại Hệ điều hành (Rebuild OS) chỉ với 1 Click',
      category: 'Hệ điều hành & Phần mềm',
      readTime: '5 phút đọc',
      updatedAt: '22/08/2026',
      author: 'Đội ngũ Kỹ thuật AZVPS',
      summary: 'Chi tiết các bước cài mới lại hệ điều hành Ubuntu 24.04, Ubuntu 22.04, Debian 12, Alpine Linux, và Rocky Linux hoàn toàn tự động trong 30 giây.',
      content: (
        <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* Warning Callout */}
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="font-bold">LƯU Ý QUAN TRỌNG:</strong> Việc cài đặt lại hệ điều hành sẽ xóa toàn bộ dữ liệu trên ổ cứng hiện tại để khởi tạo lại hệ điều hành sạch 100%. Hãy đảm bảo bạn đã tạo bản sao lưu dữ liệu (Snapshot / Backup) trước khi tiến hành!
            </div>
          </div>

          {/* Section 1: Comparison of Linux Distros */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Lựa chọn Hệ điều hành phù hợp với nhu cầu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-orange-500" /> Ubuntu 24.04 LTS (Khuyên Dùng)
                </div>
                <p className="text-xs text-slate-600">
                  Bản phân phối Linux phổ biến nhất toàn cầu, nhân Linux 6.8 hiện đại, hỗ trợ tối đa cho Docker, Node.js, Python, .NET và các Web Server Nginx/Apache.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-red-600" /> Debian 12 (Bookworm)
                </div>
                <p className="text-xs text-slate-600">
                  Nổi tiếng về độ ổn định tuyệt đối và tiết kiệm tài nguyên RAM. Cực kỳ thích hợp cho các máy chủ Production chạy cơ sở dữ liệu MySQL, PostgreSQL hoặc Redis.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-cyan-600" /> Alpine Linux 3.20 (Siêu Nhẹ)
                </div>
                <p className="text-xs text-slate-600">
                  Dung lượng cài đặt chỉ khoảng 10MB, chiếm dụng dưới 50MB RAM khi khởi động. Lựa chọn số 1 cho các ứng dụng Microservices và Docker Host chuyên dụng.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" /> Rocky Linux 9 (Enterprise RHEL)
                </div>
                <p className="text-xs text-slate-600">
                  Chuẩn doanh nghiệp 100% tương thích mã nguồn Red Hat Enterprise Linux (RHEL), phù hợp cho các phần mềm doanh nghiệp và cPanel/DirectAdmin.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Step by step walkthrough */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Các bước thực hiện Reinstall OS trên bảng điều khiển
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs flex-shrink-0">
                  B1
                </div>
                <div>
                  <p className="font-bold text-slate-900">Vào trang Quản lý VPS và chuyển sang Tab Install</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tại trang quản lý VPS, nhấn vào tab <strong>Install</strong> &gt; chọn danh mục con <strong>Reinstall OS</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs flex-shrink-0">
                  B2
                </div>
                <div>
                  <p className="font-bold text-slate-900">Chọn Hệ điều hành và Đặt mật khẩu Root</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Chọn phiên bản Linux bạn muốn cài đặt từ danh sách dropdown. Nhập mật khẩu Root mới hoặc nhấn vào biểu tượng chìa khóa <strong>🔑</strong> để hệ thống tự tạo mật khẩu mạnh 16 ký tự.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs flex-shrink-0">
                  B3
                </div>
                <div>
                  <p className="font-bold text-slate-900">Nhấn nút Reinstall và chờ hoàn tất</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống tự động format container, giải nén image hệ điều hành mới và gán lại IP cùng mật khẩu trong khoảng <strong>30 - 60 giây</strong>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    }
  };

  const currentArticle = articles[id] || articles['ssh-guide'];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Link href="/dashboard/tickets" className="hover:text-[#1F1F1F] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Hỗ trợ &amp; Ticket
          </Link>
          <span>/</span>
          <span>Cơ sở kiến thức</span>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{currentArticle.title}</span>
        </div>

        {/* Article Main Card */}
        <article className="bg-white rounded-md border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="inline-block px-3 py-1 bg-blue-50 text-[#1F1F1F] border border-blue-200 rounded-full text-xs font-bold mb-3">
              {currentArticle.category}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {currentArticle.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
              <span>Tác giả: <strong className="text-slate-700">{currentArticle.author}</strong></span>
              <span>•</span>
              <span>Cập nhật: <strong className="text-slate-700">{currentArticle.updatedAt}</strong></span>
              <span>•</span>
              <span>Thời gian đọc: <strong className="text-slate-700">{currentArticle.readTime}</strong></span>
            </div>
          </div>

          {/* Article Body Content */}
          <div className="p-6 sm:p-8">
            {currentArticle.content}
          </div>

          {/* Article Footer & Helpful Feedback */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800">Bài viết này có hữu ích với bạn không?</p>
              <p className="text-slate-600 mt-0.5">Phản hồi của bạn giúp chúng tôi cải thiện tài liệu tốt hơn.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert('Cảm ơn bạn đã đánh giá hữu ích!')}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-sm transition-colors shadow-xs"
              >
                👍 Hữu ích
              </button>
              <button 
                onClick={() => alert('Cảm ơn phản hồi! Chúng tôi sẽ bổ sung thêm chi tiết.')}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-sm transition-colors shadow-xs"
              >
                👎 Cần chi tiết hơn
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles Cards */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900">Các bài viết hướng dẫn liên quan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/knowledgebase/ssh-guide"
              className="p-4 bg-white border border-slate-200 rounded hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <p className="font-bold text-slate-900 text-xs group-hover:text-[#1F1F1F]">
                Hướng dẫn kết nối SSH vào VPS Linux
              </p>
              <p className="text-[11px] text-slate-600 mt-1">Cách dùng terminal và phần mềm MobaXterm/Putty.</p>
            </Link>

            <Link
              href="/dashboard/knowledgebase/reinstall-os"
              className="p-4 bg-white border border-slate-200 rounded hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <p className="font-bold text-slate-900 text-xs group-hover:text-[#1F1F1F]">
                Cách cài đặt lại Hệ điều hành (Rebuild OS)
              </p>
              <p className="text-[11px] text-slate-600 mt-1">Các bước tự động cài Ubuntu, Debian, Alpine.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
