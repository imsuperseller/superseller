import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'optional', // Prevents font-load reflow flash (swap causes visible jump)
});

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  title: 'SuperSeller AI | Your AI Crew for Business',
  description: 'Seven AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $79/mo.',
  keywords: ['AI business automation', 'AI video production', 'AI receptionist', 'AI lead generation', 'small business AI', 'realtor video'],
  authors: [{ name: 'SuperSeller AI Team' }],
  creator: 'SuperSeller AI',
  publisher: 'SuperSeller AI',
  icons: {
    icon: [
      { url: '/superseller-logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/superseller-logo.png',
    apple: '/superseller-logo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://superseller.agency'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SuperSeller AI | Your AI Crew for Business',
    description: 'Seven AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $79/mo.',
    url: 'https://superseller.agency',
    siteName: 'SuperSeller AI',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SuperSeller AI — Your AI Crew for Business',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperSeller AI | Your AI Crew for Business',
    description: 'Seven AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $79/mo.',
    images: ['/opengraph-image.png'],
    creator: '@iamsuperseller',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: Add real codes when Search Console is set up
  // verification: { google: 'REAL_CODE_HERE' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d1b2e' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1b2e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${outfit.variable} dark`} style={{ backgroundColor: '#0d1b2e' }}>
      <body className={outfit.className} suppressHydrationWarning style={{ fontFamily: 'var(--font-outfit), sans-serif', backgroundColor: '#0d1b2e' }}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
