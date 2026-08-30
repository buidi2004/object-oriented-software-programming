'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  height?: string;
  speed?: number; // lower means slower (stronger parallax effect). Default is 0.5. Range usually -1 to 1.
  className?: string;
  overlay?: boolean;
}

export const ParallaxImage = ({
  src,
  alt,
  height = '400px',
  speed = 0.5,
  className = '',
  overlay = false
}: ParallaxImageProps) => {
  const ref = useRef(null);
  
  // Track scroll position relative to the element's position in the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress (0 to 1) to y displacement
  // E.g. speed = 0.5 means image moves at half speed compared to scroll
  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden w-full ${className}`} 
      style={{ height }}
    >
      <motion.div
        style={{ 
          y, 
          height: '140%', // Make image taller so we have room to parallax without showing edges
          width: '100%',
          position: 'absolute',
          top: '-20%',
          left: 0
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        {overlay && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        )}
      </motion.div>
    </div>
  );
};
