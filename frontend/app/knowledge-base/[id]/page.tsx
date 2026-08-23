'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Loader, AlertCircle, Clock, Eye, 
  ThumbsUp, ThumbsDown, Share2, Copy, Check, BookOpen, 
  LifeBuoy, MessageSquare, ChevronRight, ShieldCheck, Zap
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryTag: string;
  viewCount: number;
}

export default function KnowledgeBaseDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<KbArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/KnowledgeBase/${articleId}`);
      if (res.data) {
        setArticle(res.data);
        api.patch(`/KnowledgeBase/${articleId}/view`).catch(() => {});
      } else {
        setArticle({
          id: articleId,
          title: 'Hướng Dẫn Kết Nối SSH & Cấu Hình Bảo Mật Máy Chủ Ubuntu 24.04 LTS',
          slug: 'huong-dan-ssh-bao-mat-vps-ubuntu-24',
          categoryTag: 'Máy Chủ & Cloud VPS',
          viewCount: 4120,
          content: `
            <h3>1. Kết Nối Máy Chủ Lần Đầu Qua SSH</h3>
            <p>Sau khi khởi tạo Cloud VPS, mở Terminal (trên macOS/Linux) hoặc PowerShell (trên Windows) và chạy lệnh sau:</p>
            <pre><code>ssh root@103.178.234.12</code></pre>
            
            <h3>2. Cập Nhật Hệ Thống Gói Package</h3>
            <p>Trước khi cài đặt bất kỳ phần mềm nào, hãy luôn đồng bộ và nâng cấp danh sách kho ứng dụng:</p>
            <pre><code>sudo apt update && sudo apt upgrade -y</code></pre>

            <h3>3. Tạo Tài Khoản Người Dùng Mới Với Quyền Sudo</h3>
            <p>Nhằm đảm bảo an toàn tuyệt đối, không nên sử dụng tài khoản root trực tiếp để chạy các dịch vụ web:</p>
            <pre><code>adduser deployer
usermod -aG sudo deployer</code></pre>

            <h3>4. Kích Hoạt Tường Lửa UFW Firewall</h3>
            <p>Chỉ cho phép các cổng kết nối cần thiết hoạt động:</p>
            <pre><code>sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable</code></pre>
          `
        });
      }
    } catch {
      setArticle({
        id: articleId,
        title: 'Hướng Dẫn Kết Nối SSH & Cấu Hình Bảo Mật Máy Chủ Ubuntu 24.04 LTS',
        slug: 'huong-dan-ssh-bao-mat-vps-ubuntu-24',
        categoryTag: 'Máy Chủ & Cloud VPS',
        viewCount: 4120,
        content: `
          <h3>1. Kết Nối Máy Chủ Lần Đầu Qua SSH</h3>
          <p>Mở Terminal và chạy lệnh kết nối:</p>
          <pre><code>ssh root@103.178.234.12</code></pre>
          
          <h3>2. Cập Nhật Hệ Thống Gói Package</h3>
          <pre><code>sudo apt update && sudo apt upgrade -y</code></pre>

          <h3>3. Kích Hoạt Tường Lửa UFW</h3>
          <pre><code>sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable</code></pre>
        `
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-zinc-50">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-800 mb-3" />
        <h2 className="text-xl font-bold text-black">{error || 'Không tìm thấy bài viết.'}</h2>
        <Link href="/knowledge-base" className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg shadow-sm">
          Quay lại Thư viện tài liệu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900 selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/" className="hover:text-black transition-colors">TRANG CHỦ</Link>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <Link href="/knowledge-base" className="hover:text-black transition-colors">KNOWLEDGE BASE</Link>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <span className="text-black font-bold truncate max-w-xs">{article.categoryTag}</span>
        </nav>

        {/* Back Link */}
        <div>
          <Link 
            href="/knowledge-base" 
            className="inline-flex items-center gap-2 text-xs font-bold text-black hover:text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Về Trung Tâm Tài Liệu</span>
          </Link>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-2xs space-y-8">
          
          {/* Article Header */}
          <div className="border-b border-zinc-100 pb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-black bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-300">
                {article.categoryTag}
              </span>
              <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> 5 phút đọc
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" /> {article.viewCount.toLocaleString()} lượt xem
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                  title="Sao chép liên kết"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-black font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
              <span className="font-bold text-black">Tác giả:</span> Đội ngũ Kỹ Thuật SEN CloudHost
              <span>•</span>
              <span className="text-zinc-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Đã kiểm thử kỹ thuật 100%
              </span>
            </div>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-zinc max-w-none prose-headings:font-black prose-headings:text-black prose-p:text-zinc-700 prose-p:leading-relaxed prose-pre:bg-[#121212] prose-pre:text-zinc-100 prose-pre:rounded-2xl prose-pre:p-5 prose-pre:shadow-md prose-code:text-black prose-code:font-mono prose-code:font-bold prose-code:text-xs text-sm"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Was This Helpful? Section */}
          <div className="border-t border-zinc-100 pt-8 mt-10">
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-black">Bài viết này có hữu ích cho bạn không?</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Phản hồi của bạn giúp chúng tôi cải thiện chất lượng tài liệu!</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeedbackGiven('yes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    feedbackGiven === 'yes'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Hữu ích ({feedbackGiven === 'yes' ? 'Đã cảm ơn' : 'Có'})</span>
                </button>

                <button
                  onClick={() => setFeedbackGiven('no')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    feedbackGiven === 'no'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Chưa giải quyết được</span>
                </button>
              </div>
            </div>
          </div>

          {/* Need Further Help CTA - Dark Monochromatic */}
          <div className="bg-[#121212] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span>Bạn Cần Kỹ Sư Hỗ Trợ Trực Tiếp?</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Gửi ticket hoặc gọi Hotline 1900 6868 để được kỹ sư Level 3 hỗ trợ giải quyết lỗi tức thì.
              </p>
            </div>

            <Link
              href="/contact?topic=technical"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gửi Yêu Cầu Hỗ Trợ 1-1</span>
            </Link>
          </div>

        </article>

      </div>
    </div>
  );
}
