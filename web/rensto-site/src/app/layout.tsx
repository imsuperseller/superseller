import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { RouteAwareLayout } from '@/components/RouteAwareLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rensto - Business Automation & AI Agents',
  description:
    'Transform your business with AI-powered automation agents. Build, deploy, and manage intelligent workflows that scale your operations.',
  keywords:
    'business automation, AI agents, workflow automation, n8n, artificial intelligence',
  authors: [{ name: 'Rensto' }],
  creator: 'Rensto',
  publisher: 'Rensto',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Rensto - Business Automation & AI Agents',
    description:
      'Transform your business with AI-powered automation agents. Build, deploy, and manage intelligent workflows that scale your operations.',
    url: 'https://rensto.com',
    siteName: 'Rensto',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rensto - Business Automation & AI Agents',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rensto - Business Automation & AI Agents',
    description:
      'Transform your business with AI-powered automation agents. Build, deploy, and manage intelligent workflows that scale your operations.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#110d28' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <RouteAwareLayout>{children}</RouteAwareLayout>
        </Providers>
      </body>
    </html>
  );
}
