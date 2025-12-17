import { OfferConfiguration } from '@/types/offer';

export const LITAL_PRICING_CONFIG: OfferConfiguration = {
    id: 'lital',
    currency: 'usd',
    meta: {
        title: 'Lital Growth Plan',
        themeColor: 'rensto-blue',
        pronouns: 'he'
    },
    base: {
        id: 'core_gm',
        label: 'The AI General Manager',
        price: 4997, // High Ticket Pivot
        description: 'Meet your new best employee. He lives on WhatsApp, never sleeps, and manages all 4 brands simultaneously.',
        features: [
            'WhatsApp-Based Management Core',
            'Full Brand Voice Training (4 Brands)',
            'Access to All Digital Assets (Drive/Cloud)',
            'Unlimited Content Drafts & Revisions',
            'Multi-Language Support (Hebrew/English)',
            '24/7 Availability (No Sick Days)',
            'Workforce of 3 Humans in 1 AI',
            '1st Month "Chief of Staff" Support Included'
        ]
    },
    supportOptions: [
        {
            id: 'support_mechanic',
            label: 'The Mechanic (Tech Only)',
            price: 497,
            interval: 'month',
            description: 'Essential technical insurance. We keep the servers running.',
            features: ['24/7 Server Uptime', 'API Connection Protection', 'Emergency Bug Shield']
        },
        {
            id: 'support_chief',
            label: 'The Chief of Staff (Growth)',
            price: 1497,
            interval: 'month',
            recommended: true,
            description: 'We manage the manager. Monthly strategy & optimization.',
            features: ['Everything in Mechanic', 'Monthly Strategy Call', 'Prompt Tuning & Optimization', 'New Feature Priority Access']
        }
    ],
    upgrades: [
        {
            id: 'cap_social_keys',
            label: 'Unlock: Social Posting Power',
            price: 1500,
            type: 'one_time',
            description: 'Give him the keys to Instagram & Facebook. He logs in and posts for you.'
        },
        {
            id: 'cap_customer_voice',
            label: 'Unlock: Customer Service Voice',
            price: 1200,
            type: 'one_time',
            description: 'Give him a voice. He replies to comments & DMs 24/7 so you never miss a lead.'
        },
        {
            id: 'cap_strategy_brain',
            label: 'Unlock: Strategic Analysis',
            price: 800,
            type: 'one_time',
            description: 'Teach him to analyze data. He sends a weekly "How We Did" report + viral ideas.'
        }
    ]
};

export type PricingConfig = typeof LITAL_PRICING_CONFIG;


