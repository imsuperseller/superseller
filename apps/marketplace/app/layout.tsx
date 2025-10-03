import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rensto Marketplace - Automation Solutions',
  description: 'Professional automation workflows and solutions for businesses of all sizes. Email automation, business process automation, content generation, and more.',
  keywords: 'automation, workflows, business automation, email automation, n8n, airtable, notion',
  authors: [{ name: 'Rensto' }],
  creator: 'Rensto',
  publisher: 'Rensto',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://marketplace.rensto.com'),
  openGraph: {
    title: 'Rensto Marketplace - Automation Solutions',
    description: 'Professional automation workflows and solutions for businesses of all sizes.',
    url: 'https://marketplace.rensto.com',
    siteName: 'Rensto Marketplace',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rensto Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rensto Marketplace - Automation Solutions',
    description: 'Professional automation workflows and solutions for businesses of all sizes.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-dark-900 text-white antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

