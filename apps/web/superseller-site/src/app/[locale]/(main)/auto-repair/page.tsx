import { Metadata } from 'next';
import { getNiche } from '@/data/niches';
import { NichePage } from '@/components/niche/NichePage';

const niche = getNiche('auto-repair')!;

export const metadata: Metadata = {
  title: niche.metaTitle,
  description: niche.metaDescription,
  openGraph: {
    title: niche.metaTitle,
    description: niche.metaDescription,
    url: `https://superseller.agency/${niche.slug}`,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: niche.metaTitle,
    description: niche.metaDescription,
    images: ['/opengraph-image.png'],
  },
};

export default function AutoRepairPage() {
  return <NichePage niche={niche} />;
}
