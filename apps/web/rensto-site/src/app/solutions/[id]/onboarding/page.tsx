import { AITableService } from '@/lib/services/AITableService';
import OnboardingClient from './OnboardingClient';
import { notFound } from 'next/navigation';

interface OnboardingPageProps {
    params: {
        id: string;
    };
}

export const metadata = {
    title: 'Mission Configuration | Rensto',
    description: 'Autonomous service onboarding and grid cluster synchronization.',
};

export default async function OnboardingPage({ params }: OnboardingPageProps) {
    const products = await AITableService.getProducts();
    const product = products.find(p => (p['Product ID'] || p.id) === params.id);

    if (!product) {
        notFound();
    }

    // Map AITable fields to expected product structure if necessary
    const mappedProduct = {
        ...product,
        name: product['Product Name'] || product.name,
        price: product['Price'] || product.price,
        stripePriceId: product['Stripe ID'] || product.stripePriceId,
        flowType: product['flowType'] || product.flowType,
        id: product['Product ID'] || product.id
    };

    return <OnboardingClient product={mappedProduct} />;
}
