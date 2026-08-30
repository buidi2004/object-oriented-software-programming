'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorClassName?: string;
}

export const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0,
  className = '',
  cursorClassName = 'inline-block w-[3px] h-[1em] bg-current ml-1 animate-pulse align-middle'
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!hasStarted) {
      timeout = setTimeout(() => {
        setHasStarted(true);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }

    if (displayedText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, hasStarted, text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className={cursorClassName} />
      )}
    </span>
  );
};
