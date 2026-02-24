import { Metadata } from 'next';
import { PricingSection } from '@/components/pricing/PricingSection';
import { CreditSlider } from '@/components/pricing/CreditSlider';

export const metadata: Metadata = {
  title: 'Pricing | Rensto',
  description:
    'Simple credit-based pricing. Buy credits, use them across 7 specialized AI agents. Plans start at $79/mo for 500 credits.',
  keywords: ['AI pricing', 'credit-based pricing', 'AI automation cost', 'affordable AI', '$79 AI plan'],
  openGraph: {
    title: 'Pricing | Rensto',
    description: 'Simple credit-based pricing. Plans start at $79/mo for 500 credits. Use across all 7 specialized agents.',
    url: 'https://rensto.com/pricing',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Rensto',
    description: 'AI crew starting at $79/mo. Buy credits, use across all agents.',
    images: ['/opengraph-image.png'],
  },
};

export default function PricingPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--rensto-bg-primary)' }}
    >
      <PricingSection />
      <section className="pb-24 px-4">
        <CreditSlider />
      </section>
    </main>
  );
}
