/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5053';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend API
      },
      {
        source: '/hubs/:path*',
        destination: `${backendUrl}/hubs/:path*`, // Proxy to Backend SignalR Hubs
      },
    ]
  },
  output: 'standalone',
};

export default nextConfig;
