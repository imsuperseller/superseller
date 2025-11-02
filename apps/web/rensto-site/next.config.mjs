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

  // Portal routing configuration
  async rewrites() {
    return [
      {
        source: '/ben-ginati-portal',
        destination: '/portal/tax4us',
      },
      {
        source: '/portal/:customer*',
        destination: '/portal/[customer]/:customer*',
      },
    ];
  },

  // Disable webpack optimizations that might cause SSR issues
  webpack: (config, { isServer }) => {
    // Handle both server and client-side issues
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
    } else {
      // Client-side fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'fs/promises': false,
        dns: false,
        'timers/promises': false,
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        snappy: false,
        socks: false,
        aws4: false,
        'mongodb-client-encryption': false,
      };
    }

    return config;
  },
};

export default nextConfig;
