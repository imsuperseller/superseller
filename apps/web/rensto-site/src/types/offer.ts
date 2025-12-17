export type Interval = 'month' | 'year';

export interface BaseProduct {
    id: string;
    label: string;
    price: number;
    description: string;
    features: string[];
    originalPrice?: number; // For anchor pricing if needed
}

export interface SupportTier {
    id: string;
    label: string;
    price: number;
    interval: Interval;
    description: string;
    features: string[];
    recommended?: boolean;
}

export interface UpgradeOption {
    id: string;
    label: string;
    price: number;
    type: 'one_time' | 'subscription'; // Subscription upgrades not fully supported in UI yet but good to type
    description: string;
}

export interface OfferConfiguration {
    id: string; // The slug (e.g., 'lital', 'demo-agent')
    currency: string;
    meta: {
        title: string;
        themeColor: string; // e.g., 'rensto-blue'
        pronouns: 'he' | 'she' | 'it'; // For dynamic text generation keying
    };
    base: BaseProduct;
    supportOptions: SupportTier[];
    upgrades: UpgradeOption[];
}
