import { Metadata } from 'next';
import HomePageClient from '../HomePageClient';

export const metadata: Metadata = {
  title: 'SuperSeller AI | Turn Your Business into a Selling Machine',
  description:
    'Seven AI agents that produce videos, post your social media, answer calls, and generate leads — turning small business owners into Super Sellers. Starting at $79/mo.',
  keywords: [
    'AI business automation',
    'AI video production',
    'AI social media',
    'AI receptionist',
    'AI lead generation',
    'small business AI',
    'AI content creation',
  ],
};

export default function Page() {
  return <HomePageClient />;
}
