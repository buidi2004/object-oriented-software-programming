'use client';

import React from 'react';

export function MysqlLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12.02 2C6.5 2 2 6.5 2 12.02c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.03 10.03 0 0 0 22.04 12C22.04 6.5 17.54 2 12.02 2z" fill="#00758F" />
      <path d="M14.5 10.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z" fill="#F29111" />
    </svg>
  );
}

export function PostgresLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" fill="#336791" />
    </svg>
  );
}

export function RedisLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.31l7.5 4.12-2.88 1.59L12 7.62l-4.62 2.4-2.88-1.59L12 4.31zm-8 6.44l3.5 1.92v4.88L4 15.63v-4.88zm8 9.38l-3.5-1.92v-4.88l3.5 1.92v4.88zm1-4.88l3.5-1.92v4.88L13 17.25v-4.88zm7-1.62l-3.5 1.92v-4.88l3.5-1.92v4.88z" fill="#DC382D" />
    </svg>
  );
}

export function MinecraftLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#5C8D37" />
      <path d="M3 11h18v10H3z" fill="#866043" />
      <path d="M7 7h3v4H7zm7 0h3v4h-3zM7 15h10v2H7zm3 2h4v2h-4z" fill="#2E4817" />
    </svg>
  );
}

export function Cs2Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#E67E22" />
      <path d="M7 6h10v3H10v2h7v7H7v-3h7v-3H7V6z" fill="#FFFFFF" />
      <circle cx="16" cy="15" r="1.5" fill="#2C3E50" />
    </svg>
  );
}

export function RustGameLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#CD412B" />
      <path d="M8 8h8v8H8z" fill="#FFFFFF" opacity="0.9" />
      <path d="M10 10h4v4h-4z" fill="#CD412B" />
    </svg>
  );
}

export function AmdLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#000000" />
      <path d="M5 5h14v14H5V5zm4 4v6h6V9H9zm2 2h2v2h-2v-2z" fill="#ED1C24" />
    </svg>
  );
}

export function IntelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0068B5" />
      <path d="M7 10h2v4H7zm3-2h2v6h-2zm3 1h2v5h-2zm3-1h2v6h-2z" fill="#FFFFFF" />
    </svg>
  );
}

export function DellLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#007DB8" />
      <text x="12" y="16" fontSize="11" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">DELL</text>
    </svg>
  );
}

export function NginxLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm-1 14H9V8l2 3.5V8h2v8l-2-3.5V16z" fill="#009639" />
    </svg>
  );
}

export function DockerLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M13.98 11.08h2.04V9.04H13.98v2.04zm-2.55 0h2.04V9.04h-2.04v2.04zm-2.55 0h2.04V9.04H8.88v2.04zm-2.55 0h2.04V9.04H6.33v2.04zm7.65-2.55h2.04V6.49h-2.04v2.04zm-2.55 0h2.04V6.49h-2.04v2.04zm-2.55 0h2.04V6.49H8.88v2.04zm5.1-2.55h2.04V3.94h-2.04v2.04zm8.65 6.78c-.46-.33-1.5-.47-2.31-.36-.13-.56-.44-1.07-.92-1.44l-.45-.35-.35.45c-.38.5-.55 1.13-.5 1.76-.3.12-.9.18-1.5.18H2.4c-.22 0-.4.18-.4.4 0 2.2 1.34 4.09 3.32 4.88 1.05.42 2.21.64 3.42.64 4.54 0 8.35-3.08 9.38-7.29.53.03 1.63-.03 2.4-.76l.39-.37-.43-.39z" fill="#2496ED" />
    </svg>
  );
}

export function WordpressLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#21759B" />
      <path d="M12 3.5a8.5 8.5 0 0 0-5.7 14.8l4.4-12.2c.1-.4.4-.6.8-.6h.1c.4 0 .7.2.8.6l4.4 12.2A8.5 8.5 0 0 0 12 3.5zm-6.8 9.1L8.5 19a8.5 8.5 0 0 1-3.3-6.4zm10.1 6.4 3.3-6.4a8.5 8.5 0 0 1-3.3 6.4z" fill="#FFFFFF" />
    </svg>
  );
}

export function GhostLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#15171A" />
      <path d="M12 6c-3.3 0-6 2.7-6 6v6l2-2 2 2 2-2 2 2 2-2 2 2v-6c0-3.3-2.7-6-6-6zm-2 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#FFFFFF" />
    </svg>
  );
}

export function NextcloudLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0082C9" />
      <circle cx="12" cy="12" r="3.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <circle cx="6.5" cy="12" r="2" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      <circle cx="17.5" cy="12" r="2" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function N8nLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#EA4B71" />
      <path d="M7 12h4v4H7zm6-4h4v4h-4zm0 8h4v4h-4z" fill="#FFFFFF" />
    </svg>
  );
}

export function MinioLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#C72C48" />
      <path d="M6 8l6 4 6-4v8l-6 4-6-4V8z" fill="#FFFFFF" />
    </svg>
  );
}

export function AwsS3Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#569A31" />
      <path d="M12 6l6 3.5v5L12 18l-6-3.5v-5L12 6zm0 2.2L7.8 10.6 12 13l4.2-2.4L12 8.2z" fill="#FFFFFF" />
    </svg>
  );
}

export function SectigoLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0A2540" />
      <path d="M12 4L5 7v5c0 5 3.5 9.5 7 11 3.5-1.5 7-6 7-11V7l-7-3zm-1 12l-3-3 1.4-1.4 1.6 1.6 4.6-4.6L17 10l-6 6z" fill="#00D4B2" />
    </svg>
  );
}

export function DigicertLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#004380" />
      <path d="M12 5l6 3v4c0 4-3 7-6 8-3-1-6-4-6-8V8l6-3zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#FFC72C" />
    </svg>
  );
}

export function CpanelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF6C2C" />
      <path d="M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5c2 0 3.7-1.2 4.5-3h-2.3a2.5 2.5 0 0 1-2.2 1.5A2.5 2.5 0 0 1 9.5 12 2.5 2.5 0 0 1 12 9.5c1 0 1.8.6 2.2 1.5h2.3A5 5 0 0 0 12 7z" fill="#FFFFFF" />
    </svg>
  );
}
