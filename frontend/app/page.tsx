import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'CloudHost VN - Cloud VPS & Hosting Việt Nam',
  description: 'Nhà cung cấp dịch vụ Cloud VPS, NVMe Hosting, Tên miền hàng đầu Việt Nam',
};

export default function HomePage() {
  return <HomePageClient />;
}
