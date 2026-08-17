'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUIStore } from '../store/useUIStore';

/** Mở AuthModal khi URL có ?auth=login|register */
export function AuthQueryListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setAuthModal = useUIStore((s) => s.setAuthModal);
  const setAuthRedirect = useUIStore((s) => s.setAuthRedirect);

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth !== 'login' && auth !== 'register') return;

    const redirect = searchParams.get('redirect') ?? searchParams.get('returnUrl');
    setAuthModal(true, auth);
    setAuthRedirect(redirect);

    const next = new URLSearchParams(searchParams.toString());
    next.delete('auth');
    next.delete('redirect');
    next.delete('returnUrl');
    const qs = next.toString();
    router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false });
  }, [pathname, router, searchParams, setAuthModal, setAuthRedirect]);

  return null;
}
