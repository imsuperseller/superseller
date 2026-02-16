import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
    // Allow large bodies for /video/create uploads (floorplan + realtor base64)
    serverActions: { bodySizeLimit: '50mb' },
  },

  // Transpile packages that use modern ESM but are not fully compatible with server build
  transpilePackages: ['recharts'],

  // Enable compression
  compress: true,

  // Enable Turbopack
  turbopack: {},

  // Enable image optimization
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },

  // Disable static exports
  output: 'standalone',


  typescript: {
    ignoreBuildErrors: true,
  },

  // Legacy route redirects
  async redirects() {
    return [
      {
        source: '/solutions',
        destination: '/niches',
        permanent: true,
      },
      {
        source: '/portal',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/lead-generator.html',
        destination: '/subscriptions',
        permanent: true,
      },

      {
        source: '/control/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
      {
        source: '/workflow-dashboard',
        destination: '/admin',
        permanent: true,
      },
      // /video is now the dashboard (My Videos). No redirect needed.
    ];
  },


  // Cache headers for optimal CDN and browser caching
  async headers() {
    return [
      {
        // HTML pages - Optimized for Edge caching with stale-while-revalidate
        // Moved to top so more specific rules (like API) can override
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=31536000, max-age=60',
          },
        ],
      },
      {
        // Video routes: no cache — prevents server/client hydration mismatch from stale RSC vs fresh client bundle
        source: '/video/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
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
        // Image files - Cache for 1 year, allow browser caching
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
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
