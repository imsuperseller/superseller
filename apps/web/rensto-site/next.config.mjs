/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that might cause issues
  experimental: {
    // Disable optimizePackageImports temporarily
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Disable image optimization for now
  images: {
    unoptimized: true,
  },

  // Disable static exports
  output: 'standalone',

  // Disable ESLint and TypeScript checking for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable webpack optimizations that might cause SSR issues
  webpack: (config, { isServer }) => {
    // Only handle server-side issues
    if (isServer) {
      // Provide empty modules for browser-only packages
      config.resolve.alias = {
        ...config.resolve.alias,
        'gsap': false,
        'socket.io-client': false,
        'framer-motion': false,
        'recharts': false,
        '@stripe/stripe-js': false,
      };
    }

    return config;
  },
};

export default nextConfig;
