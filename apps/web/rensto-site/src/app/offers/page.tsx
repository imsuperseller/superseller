import { AITableService } from '@/lib/services/AITableService';
import OffersPageClient from './OffersPageClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Special Automation Offers | Rensto',
  description: 'Exclusive automation infrastructure offers for serious founders. Strategic audits, full ecosystems, and ongoing scale partnerships.',
};

export default async function OffersPage() {
  const products = await AITableService.getProducts();

  return <OffersPageClient initialProducts={products} />;
}
