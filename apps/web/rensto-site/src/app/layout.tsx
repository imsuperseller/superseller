import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { RouteAwareLayout } from '@/components/RouteAwareLayout';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { CTAPopup } from '@/components/CTAPopup';
import { SupportWidget } from '@/components/SupportWidget';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { GTMProvider } from '@/components/analytics/GTMProvider';
import { Schema, organizationSchema, websiteSchema, localBusinessSchema } from '@/components/seo/Schema';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rensto | AI-Powered Business Automation Platform',
  description: 'Scale your business with autonomous AI agents and intelligent workflow automation. Transform operations with Rensto.',
  keywords: ['business automation', 'AI agents', 'workflow automation', 'digital transformation'],
  authors: [{ name: 'Rensto Team' }],
  creator: 'Rensto',
  publisher: 'Rensto',
  icons: {
    icon: '/favicon.ico',
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
    title: 'Rensto | AI-Powered Business Automation Platform',
    description: 'Scale your business with autonomous AI agents and intelligent workflow automation.',
    url: 'https://rensto.com',
    siteName: 'Rensto',
    images: [
      {
        url: '/opengraph-image.png',
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
    title: 'Rensto | AI-Powered Business Automation Platform',
    description: 'Scale your business with autonomous AI agents and intelligent workflow automation.',
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
        <GTMProvider>
          <Providers>
            <RouteAwareLayout>
              <Schema type="Organization" data={organizationSchema} />
              <Schema type="WebSite" data={websiteSchema} />
              <Schema type="LocalBusiness" data={localBusinessSchema} />
              {children}
              <StickyMobileCTA />
              <CTAPopup />
              <SupportWidget mode="floating" />
              <WhatsAppButton />
            </RouteAwareLayout>
          </Providers>
        </GTMProvider>
      </body>
    </html>
  );
}
