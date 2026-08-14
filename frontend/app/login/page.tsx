'use client';

import { useEffect } from 'react';

export default function LoginRedirectPage() {
  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = new URLSearchParams({ auth: 'login' });
    const redirect = current.get('redirect') ?? current.get('returnUrl');
    if (redirect) next.set('redirect', redirect);
    window.location.replace(`/?${next.toString()}`);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
