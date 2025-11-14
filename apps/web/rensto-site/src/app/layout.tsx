import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { RouteAwareLayout } from '@/components/RouteAwareLayout';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
});

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
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className={outfit.className} suppressHydrationWarning style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
        <Providers>
          <RouteAwareLayout>
            {children}
          </RouteAwareLayout>
        </Providers>
      </body>
    </html>
  );
}
