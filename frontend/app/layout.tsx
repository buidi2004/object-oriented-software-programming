import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-mono',
});

import { LiveChatWidget } from '@/src/components/LiveChatWidget';
import { GlobalUI } from '@/src/components/GlobalUI';
import { AppShell } from '@/src/components/AppShell';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: "CloudHost VN - Cloud VPS & Hosting Việt Nam",
  description: "Nhà cung cấp dịch vụ Cloud VPS, NVMe Hosting, Tên miền hàng đầu Việt Nam"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[var(--surface)] text-[var(--on-surface)] font-sans">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <AppShell>
            {children}
          </AppShell>
          <LiveChatWidget />
          <GlobalUI />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
