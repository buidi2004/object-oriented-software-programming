'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { HomeHeroBanner } from './components/home-redesign/HomeHeroBanner';
import { HomeAboutSection } from './components/home-redesign/HomeAboutSection';
import { HomeStatsSection } from './components/home-redesign/HomeStatsSection';
import { HomeWhyChooseUsSection } from './components/home-redesign/HomeWhyChooseUsSection';
import { HomeServicesSection } from './components/home-redesign/HomeServicesSection';
import { HomePricingSection } from './components/home-redesign/HomePricingSection';
import { HomeSolutionsSection } from './components/home-redesign/HomeSolutionsSection';
import { HomeTestimonialsSection } from './components/home-redesign/HomeTestimonialsSection';
import { HomeFAQSection } from './components/home-redesign/HomeFAQSection';
import { HomeCertifications } from './components/home-redesign/HomeCertifications';
import { HomePartnersGlobe } from './components/home-redesign/HomePartnersGlobe';
import { HomePreFooterCTA } from './components/home-redesign/HomePreFooterCTA';
import { ScrollspyNav } from './components/ScrollspyNav';
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

  const homeNavItems = [
    { id: 'hero', label: 'Tổng quan' },
    { id: 'about', label: 'Về chúng tôi' },
    { id: 'why-us', label: 'Lợi thế' },
    { id: 'services', label: 'Dịch vụ' },
    { id: 'pricing', label: 'Bảng giá' },
    { id: 'solutions', label: 'Giải pháp' },
    { id: 'reviews', label: 'Khách hàng' },
    { id: 'faq', label: 'FAQ' },
    { id: 'partners', label: 'Đối tác' }
  ];

  return (
    <>
      <div id="hero"><HomeHeroBanner /></div>
      <ScrollspyNav items={homeNavItems} />
      <div id="about"><HomeAboutSection /></div>
      <HomeStatsSection />
      <div id="why-us"><HomeWhyChooseUsSection /></div>
      <div id="services"><HomeServicesSection /></div>
      <div id="pricing"><HomePricingSection /></div>
      <div id="solutions"><HomeSolutionsSection /></div>
      <div id="reviews"><HomeTestimonialsSection /></div>
      <HomeCertifications />
      <div id="faq"><HomeFAQSection /></div>
      <div id="partners"><HomePartnersGlobe /></div>
      <HomePreFooterCTA />
    </>
  );
}
