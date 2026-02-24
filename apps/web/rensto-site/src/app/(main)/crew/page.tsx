import { Metadata } from 'next';
import { CrewGrid } from '@/components/crew/CrewGrid';
import { Badge } from '@/components/ui/badge-enhanced';

export const metadata: Metadata = {
  title: 'The Crew | Rensto',
  description:
    'Meet your AI crew: Forge, Spoke, Market, FrontDesk, Scout, Buzz, and Cortex. Seven specialized agents, one subscription.',
  keywords: ['AI agents', 'AI crew', 'business automation', 'Forge', 'Market', 'FrontDesk', 'Scout', 'Buzz', 'Cortex', 'Spoke'],
  openGraph: {
    title: 'The Crew | Rensto',
    description: 'Meet your AI crew: Forge, Spoke, Market, FrontDesk, Scout, Buzz, and Cortex. Seven specialized agents, one subscription.',
    url: 'https://rensto.com/crew',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Crew | Rensto',
    description: 'Seven specialized agents. One subscription. Meet your crew.',
    images: ['/opengraph-image.png'],
  },
};

export default function CrewPage() {
  return (
    <main
      className="min-h-screen py-24 px-4"
      style={{ background: 'var(--rensto-bg-primary)' }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-white/5 text-white/60 border-white/10 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
            7 Specialized Agents
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
            The Crew
          </h1>
          <p className="text-xl text-[var(--rensto-text-secondary)] max-w-2xl mx-auto">
            Each agent specializes in one thing and does it better than any
            freelancer, agency, or employee. Mix and match with credits.
          </p>
        </div>
        <CrewGrid />
      </div>
    </main>
  );
}
