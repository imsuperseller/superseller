import { OfferConfiguration } from '@/types/offer';
import { LITAL_PRICING_CONFIG } from '../lital-pricing';
import { STANDARD_AI_CONFIG } from './standard-ai';

const offers: Record<string, OfferConfiguration> = {
    'lital-growth-plan': LITAL_PRICING_CONFIG,
    'lital': LITAL_PRICING_CONFIG,
    'standard-ai': STANDARD_AI_CONFIG,
    'demo': STANDARD_AI_CONFIG
};

export function getOfferConfig(slug: string): OfferConfiguration | null {
    return offers[slug] || null;
}
