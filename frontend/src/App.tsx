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
import { useCartStore } from './store/useCartStore';

export default function App() {
  const router = useRouter();
  const setIsDashboardOpen = useUIStore((s) => s.setIsDashboardOpen);
  const setIsCartOpen = useUIStore((s) => s.setIsCartOpen);
  const cartItemsCount = useCartStore((s) => s.items.length);

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
    <>
      <Hero
        onStartClick={() => handleTabChange('vps')}
        onPriceClick={() => handleTabChange('vps')}
      />
      <DomainSearch onAddToCart={() => router.push('/services/ten-mien')} />
      <VpsCalculator onAddToCart={() => router.push('/services/cloud-vps')} onViewDetails={handleViewServiceDetails} />
      <HostingPlans onAddToCart={() => router.push('/services/web-hosting')} onViewDetails={handleViewServiceDetails} />
      <InfrastructureFeatures />
      <ContactSection />
    </>
  );
}
