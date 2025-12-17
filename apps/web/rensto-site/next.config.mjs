/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that might cause issues
  experimental: {
    // Disable optimizePackageImports temporarily
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Enable Turbopack
  turbopack: {},

  // Disable image optimization for now
  images: {
    unoptimized: true,
  },

  // Disable static exports
  output: 'standalone',


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

  // Cache headers for optimal CDN and browser caching
  async headers() {
    return [
      {
        // Static assets (images, fonts, CSS, JS) - Cache for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Image files - Cache for 1 year
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Font files - Cache for 1 year
        source: '/:path*\\.(woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - No caching (always fresh)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        // HTML pages - Cache for 1 hour, allow stale-while-revalidate for 24 hours
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=0',
          },
        ],
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
