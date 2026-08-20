'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { HomeHeroBanner } from './components/home-redesign/HomeHeroBanner';
import { HomeAboutSection } from './components/home-redesign/HomeAboutSection';
import { HomeServicesSection } from './components/home-redesign/HomeServicesSection';
import { HomeSolutionsSection } from './components/home-redesign/HomeSolutionsSection';
import { HomeCertifications } from './components/home-redesign/HomeCertifications';
import { HomePartnersGlobe } from './components/home-redesign/HomePartnersGlobe';
import { HomePreFooterCTA } from './components/home-redesign/HomePreFooterCTA';
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
      (document.getElementById('contact') || document.getElementById('contact-section'))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewServiceDetails = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <>
      <HomeHeroBanner />
      <HomeAboutSection />
      <HomeServicesSection />
      <HomeSolutionsSection />
      <HomeCertifications />
      <HomePartnersGlobe />
      <HomePreFooterCTA />
    </>
  );
}
