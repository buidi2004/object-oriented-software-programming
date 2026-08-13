import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
