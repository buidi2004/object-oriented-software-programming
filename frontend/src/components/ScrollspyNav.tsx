'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollDirection } from '../hooks/useScrollDirection';

export interface ScrollspyNavItem {
  id: string; // The DOM element id to spy on
  label: string; // The text to display
}

interface ScrollspyNavProps {
  items: ScrollspyNavItem[];
  offsetTop?: number; // Adjust if header is sticky (e.g. 54px for Header)
}

export const ScrollspyNav: React.FC<ScrollspyNavProps> = ({ items, offsetTop = 54 }) => {
  const isHeaderVisible = useScrollDirection();
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');
  const [isStuck, setIsStuck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  useEffect(() => {
    const handleScroll = () => {
      // Add a small buffer (e.g. 60px) to trigger activation slightly before the section hits the very top
      const scrollPosition = window.scrollY + offsetTop + 60;

      let currentActiveId = items[0]?.id;
      for (const item of items) {
        const element = document.getElementById(item.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentActiveId = item.id;
        }
      }

      setActiveId(currentActiveId || '');
    };

    const handleStuckCheck = () => {
      if (sentinelRef.current) {
        const top = sentinelRef.current.getBoundingClientRect().top;
        const threshold = isHeaderVisible ? 70 : 16;
        setIsStuck(top <= threshold);
      }
    };

    const onScroll = () => {
      handleScroll();
      handleStuckCheck();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check

    return () => window.removeEventListener('scroll', onScroll);
  }, [items, offsetTop, isHeaderVisible]);

  useEffect(() => {
    // Update sliding indicator position and width
    const activeIndex = items.findIndex(i => i.id === activeId);
    if (activeIndex !== -1 && itemRefs.current[activeIndex] && containerRef.current) {
      const activeElement = itemRefs.current[activeIndex];
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = activeElement!.getBoundingClientRect();

      setIndicatorStyle({
        left: activeElement!.offsetLeft, // Use offsetLeft for reliable positioning within relative container
        width: elementRect.width
      });
    }
  }, [activeId, items]);

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset by the header height + scrollspy nav height to not cover the content
      const y = element.getBoundingClientRect().top + window.scrollY - offsetTop - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Sentinel element to detect when the nav reaches the sticky position */}
      <div ref={sentinelRef} className="w-full h-[1px] -mt-[1px] pointer-events-none opacity-0" />
      <div className={`sticky z-30 w-full flex justify-center transition-all duration-300 pointer-events-none ${isHeaderVisible ? 'top-[70px]' : 'top-4'} ${isStuck ? 'px-4' : 'px-0'}`}>
        <div className={`pointer-events-auto overflow-hidden flex justify-between items-center transition-all duration-500 ${
          isStuck 
            ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] rounded-2xl px-4 sm:px-8 w-[1000px] max-w-[95vw]' 
            : 'bg-white border-b border-slate-200 shadow-none rounded-none px-4 xl:px-[5%] w-full max-w-full'
        }`}>
          <div className={`relative flex items-center h-[52px] overflow-x-auto hide-scrollbar gap-1 sm:gap-6 ${isStuck ? 'w-full' : 'w-full max-w-7xl mx-auto'}`} ref={containerRef}>
            {items.map((item, index) => (
              <button
                key={item.id}
                ref={el => { itemRefs.current[index] = el; }}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1 h-full whitespace-nowrap text-[13px] font-bold transition-colors z-10 flex items-center ${
                  activeId === item.id ? 'text-[#d09e2b]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Sliding Tab Indicator */}
            {indicatorStyle.width > 0 && (
              <motion.div
                className="absolute bottom-0 h-[3px] bg-[#d09e2b] rounded-t-md"
                initial={false}
                animate={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
