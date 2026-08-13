'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DomainSearch } from './components/DomainSearch';
import { VpsCalculator } from './components/VpsCalculator';
import { HostingPlans } from './components/HostingPlans';
import { InfrastructureFeatures } from './components/InfrastructureFeatures';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { useUIStore } from './store/useUIStore';
import { CartItem } from './types';

export default function App() {
  const router = useRouter();
  const setIsDashboardOpen = useUIStore((s) => s.setIsDashboardOpen);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'vps') {
      document.getElementById('vps-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'hosting') {
      document.getElementById('hosting-plans-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'domain') {
      document.getElementById('domain-search-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'contact') {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewServiceDetails = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white relative">
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      <main>
        <Hero
          onStartClick={() => handleTabChange('vps')}
          onPriceClick={() => handleTabChange('vps')}
        />
        <DomainSearch onAddToCart={handleAddToCart} />
        <VpsCalculator onAddToCart={handleAddToCart} onViewDetails={handleViewServiceDetails} />
        <HostingPlans onAddToCart={handleAddToCart} onViewDetails={handleViewServiceDetails} />
        <InfrastructureFeatures />
        <ContactSection />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
