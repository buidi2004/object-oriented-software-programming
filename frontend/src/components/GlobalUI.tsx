'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { AuthQueryListener } from './AuthQueryListener';
import { CartDrawer } from './CartDrawer';
import { CloudDashboard } from './CloudDashboard';
import { CookieConsent } from './CookieConsent';
import { useUIStore } from '../store/useUIStore';
import { useCartStore } from '../store/useCartStore';
import { CartItem } from '../types';

export const GlobalUI = () => {
  const router = useRouter();
  const ui = useUIStore();
  const cart = useCartStore();

  const handleAuthClose = () => {
    ui.setAuthRedirect(null);
    ui.setAuthModal(false, 'login');
  };

  const handleAuthSuccess = async () => {
    // Synchronize guest cart items immediately to backend
    await cart.syncGuestCart();

    const redirect = ui.authRedirect;
    ui.setAuthRedirect(null);
    ui.setAuthModal(false, 'login');

    if (redirect && redirect.startsWith('/')) {
      router.push(redirect);
      return;
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <AuthQueryListener />
      </Suspense>

      {ui.authModal.isOpen && (
        <AuthModal
          initialMode={ui.authModal.mode}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      )}

      <CartDrawer
        isOpen={ui.isCartOpen}
        onClose={() => ui.setIsCartOpen(false)}
        cartItems={cart.items as unknown as CartItem[]}
        onRemoveItem={async (id) => {
          await cart.removeItem(id);
        }}
        onClearCart={() => cart.clearCart()}
      />

      {ui.isDashboardOpen && (
        <CloudDashboard onClose={() => ui.setIsDashboardOpen(false)} />
      )}

      <CookieConsent />
    </>
  );
};
