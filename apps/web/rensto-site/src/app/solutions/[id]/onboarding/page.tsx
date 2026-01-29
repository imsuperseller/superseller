import { PRODUCT_REGISTRY } from '@/lib/registry/ProductRegistry';
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

export default function OnboardingPage({ params }: OnboardingPageProps) {
    const product = PRODUCT_REGISTRY[params.id];

    if (!product) {
        notFound();
    }

    return <OnboardingClient product={product} />;
}
