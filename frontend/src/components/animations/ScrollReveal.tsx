'use client';

import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in';
  duration?: number;
  delay?: number;
  className?: string;
  amount?: 'some' | 'all' | number;
}

export const ScrollReveal = ({
  children,
  width = '100%',
  animation = 'slide-up',
  duration = 0.5,
  delay = 0,
  className = '',
  amount = 0.3
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });

  const getVariants = (): Variants => {
    switch (animation) {
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'zoom-in':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={{ duration, delay, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const StaggerContainer = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  animation = 'slide-up',
  className = ''
}: {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in';
  className?: string;
}) => {
  const getVariants = (): Variants => {
    switch (animation) {
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
        };
      case 'zoom-in':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
        };
    }
  };

  return (
    <motion.div variants={getVariants()} className={className}>
      {children}
    </motion.div>
  );
};
