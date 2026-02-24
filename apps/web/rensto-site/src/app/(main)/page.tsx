import { Metadata } from 'next';
import HomePageClient from '../HomePageClient';

export const metadata: Metadata = {
  title: 'Rensto | Your AI Crew for Business',
  description:
    'Six AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $299/mo. Built for realtors, locksmiths, restaurants, contractors, and more.',
  keywords: [
    'AI business automation',
    'AI video production',
    'AI receptionist',
    'AI lead generation',
    'realtor video',
    'small business AI',
  ],
};

export default function Page() {
  return <HomePageClient />;
}
