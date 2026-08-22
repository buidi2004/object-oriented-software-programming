'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface SensitiveDataFieldProps {
  value: string;
  label?: string;
  maskedPlaceholder?: string;
  className?: string;
  onViewAudit?: () => void;
}

export function SensitiveDataField({
  value,
  label,
  maskedPlaceholder = '••••••••••••••••',
  className = '',
  onViewAudit,
}: SensitiveDataFieldProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleShow = () => {
    if (!show && onViewAudit) {
      onViewAudit();
    }
    setShow(!show);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`inline-flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono ${className}`}>
      {label && <span className="text-slate-600 font-sans font-bold text-[11px]">{label}:</span>}
      <span className="text-slate-800 font-semibold select-all">
        {show ? value || '(trống)' : maskedPlaceholder}
      </span>
      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={toggleShow}
          className="p-1 rounded-sm hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
          title={show ? 'Ẩn thông tin' : 'Hiện thông tin nhạy cảm'}
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-sm hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
          title="Sao chép"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
