import type { Metadata } from "next";
import "./globals.css";

import { LiveChatWidget } from '@/components/LiveChatWidget';
import { GlobalUI } from '@/src/components/GlobalUI';

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
    <html lang="vi">
      <body className="antialiased bg-slate-50">
        {children}
        <LiveChatWidget />
        <GlobalUI />
      </body>
    </html>
  );
}
