'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    bgColor: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-900',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-900',
  },
  info: {
    icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-900',
  },
  warning: {
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    bgColor: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-900',
  },
};

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = toastConfig[type];

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 
        ${config.bgColor} 
        border rounded-xl shadow-lg 
        flex items-center gap-3 
        px-4 py-3
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
    >
      {config.icon}
      
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {message}
      </p>
      
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="p-1 rounded-lg hover:bg-white/50 transition-colors"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};

// Hook for easier usage
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}

// Static helper functions
let showToastRef: ((message: string, type?: ToastType) => void) | null = null;
let hideToastRef: (() => void) | null = null;

export const initToastHelpers = (show: (msg: string, type?: ToastType) => void, hide: () => void) => {
  showToastRef = show;
  hideToastRef = hide;
};

export const showStaticToast = (message: string, type: ToastType = 'info') => {
  showToastRef?.(message, type);
};

export const hideStaticToast = () => {
  hideToastRef?.();
};
