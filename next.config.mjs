/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Optimize packages - reduce bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
      'framer-motion',
    ],
  },
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/icon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/icon-:size.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
