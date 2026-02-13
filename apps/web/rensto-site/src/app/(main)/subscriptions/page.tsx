import type { Metadata } from 'next';
import SubscriptionsPage from './ClientPage';

export const metadata: Metadata = {
  title: 'AI Automation Subscriptions | Monthly Managed Services | Rensto',
  description: 'Get on-demand automation expertise. From lead gen to CRM sync, subscribe to a faster, leaner business.',
  alternates: {
    canonical: '/subscriptions',
  },
};

export default function Page() {
  return <SubscriptionsPage />;
}
