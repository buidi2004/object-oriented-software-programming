import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cloudservice.vn';
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/sitemap.xml`);
    if (res.ok) {
      // sitemap XML fetched from backend
    }
  } catch {}

  const routes = [
    '',
    '/services/cloud-vps',
    '/services/hosting',
    '/services/domain',
    '/services/ssl-certificates',
    '/news',
    '/knowledge-base',
    '/faqs',
    '/testimonials',
    '/loyalty',
    '/gift-cards',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
