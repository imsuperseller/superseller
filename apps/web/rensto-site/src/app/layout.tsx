import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { RouteAwareLayout } from '@/components/RouteAwareLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rensto - Business Automation Platform',
  description: 'Transform your business with AI-powered automation agents. Build, deploy, and manage intelligent workflows that scale your operations.',
  keywords: ['business automation', 'AI agents', 'workflow automation', 'digital transformation'],
  authors: [{ name: 'Rensto Team' }],
  creator: 'Rensto',
  publisher: 'Rensto',
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
    title: 'Rensto - Business Automation Platform',
    description: 'Transform your business with AI-powered automation agents.',
    url: 'https://rensto.com',
    siteName: 'Rensto',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rensto Business Automation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rensto - Business Automation Platform',
    description: 'Transform your business with AI-powered automation agents.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <RouteAwareLayout>
            {children}
          </RouteAwareLayout>
        </Providers>
      </body>
    </html>
  );
}
