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
      // Legacy → new routes
      {
        source: '/solutions',
        destination: '/crew',
        permanent: true,
      },
      {
        source: '/niches',
        destination: '/',
        permanent: true,
      },
      {
        source: '/niches/hvac',
        destination: '/home-services',
        permanent: true,
      },
      {
        source: '/niches/plumbing',
        destination: '/home-services',
        permanent: true,
      },
      {
        source: '/niches/locksmith',
        destination: '/locksmiths',
        permanent: true,
      },
      {
        source: '/niches/realtor',
        destination: '/realtors',
        permanent: true,
      },
      {
        source: '/niches/restaurant',
        destination: '/restaurants',
        permanent: true,
      },
      {
        source: '/niches/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/offers',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/process',
        destination: '/crew',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/crew',
        permanent: true,
      },
      {
        source: '/custom',
        destination: '/pricing',
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
        destination: '/pricing',
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
    ];
  },


  // Security + cache headers
  async headers() {
    return [
      {
        // Security headers — apply to ALL routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
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
