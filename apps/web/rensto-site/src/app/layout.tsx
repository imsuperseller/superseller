import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'optional', // Prevents font-load reflow flash (swap causes visible jump)
});

export const metadata: Metadata = {
  title: 'Rensto | Your AI Crew for Business',
  description: 'Six AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $299/mo.',
  keywords: ['AI business automation', 'AI video production', 'AI receptionist', 'AI lead generation', 'small business AI', 'realtor video'],
  authors: [{ name: 'Rensto Team' }],
  creator: 'Rensto',
  publisher: 'Rensto',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/rensto-logo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rensto.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rensto | Your AI Crew for Business',
    description: 'Six AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $299/mo.',
    url: 'https://rensto.com',
    siteName: 'Rensto',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Rensto — Your AI Crew for Business',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rensto | Your AI Crew for Business',
    description: 'Six AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $299/mo.',
    images: ['/opengraph-image.png'],
    creator: '@rensto',
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
    { media: '(prefers-color-scheme: light)', color: '#110d28' },
    { media: '(prefers-color-scheme: dark)', color: '#110d28' },
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
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} dark`} style={{ backgroundColor: '#110d28' }}>
      <body className={outfit.className} suppressHydrationWarning style={{ fontFamily: 'var(--font-outfit), sans-serif', backgroundColor: '#110d28' }}>
        {children}
      </body>
    </html>
  );
}
