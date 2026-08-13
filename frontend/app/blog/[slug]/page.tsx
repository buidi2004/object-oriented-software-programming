'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, AlertCircle, Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  image?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data for demo
      setTimeout(() => {
        setPost({
          id: '1',
          slug: slug,
          title: 'Hướng dẫn cài đặt VPS Cloud đầu tiên của bạn',
          excerpt: 'Bước đầu tiên để bắt đầu với cloud hosting là hiểu cách hoạt động của VPS...',
          content: '<p>Nội dung bài viết...</p>',
          author: 'Admin',
          publishedAt: '2024-01-15',
          category: 'Hướng dẫn'
        });
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch blog post:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Không tìm thấy bài viết</p>
          <Link href="/news" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back button */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Header */}
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Featured Image */}
          {post.image && (
            <div className="aspect-video overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-slate-900 mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Body */}
            <div 
              className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Related Posts Placeholder */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Link
                key={i}
                href={`/news`}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <p className="font-semibold text-slate-900">Bài viết liên quan {i}</p>
                <p className="text-sm text-slate-500 mt-1">Mô tả ngắn gọn về bài viết...</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
