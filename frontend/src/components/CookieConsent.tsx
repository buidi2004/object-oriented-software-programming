'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-2xl z-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600 font-medium leading-relaxed flex-1">
          Chúng tôi sử dụng cookies nhằm nâng cao trải nghiệm của bạn. Bằng cách nhấn "Đồng ý", bạn chấp thuận việc sử dụng cookie theo{' '}
          <Link href="/privacy" className="text-[#1F1F1F] hover:underline">
            Chính sách bảo mật
          </Link>.
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 w-full sm:w-auto px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
};
