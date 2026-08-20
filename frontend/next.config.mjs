/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = 'https://buivandihhhh.duckdns.org';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend API
      },
      {
        source: '/hubs/:path*',
        destination: `${backendUrl}/hubs/:path*`, // Proxy to Backend SignalR Hubs
      },
      {
        source: '/images/:path*',
        destination: `${backendUrl}/images/:path*`, // Proxy static images to Backend
      },
      {
        source: '/swagger/:path*',
        destination: `${backendUrl}/swagger/:path*`, // Proxy Swagger UI to Backend
      },
    ]
  },
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
