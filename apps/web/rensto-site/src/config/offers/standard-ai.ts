import { OfferConfiguration } from '@/types/offer';

export const STANDARD_AI_CONFIG: OfferConfiguration = {
    id: 'standard-ai',
    currency: 'usd',
    meta: {
        title: 'Standard Growth Plan',
        themeColor: 'rensto-blue',
        pronouns: 'it'
    },
    base: {
        id: 'standard_agent',
        label: 'The 24/7 AI Employee',
        price: 2997,
        description: 'A fully trained AI agent that lives on your site, captures leads, and books appointments while you sleep.',
        features: [
            '24/7 Lead Capture Engine',
            'Instant FAQ Responses',
            'Calendar Booking Integration',
            'Email Handoff for Complex Queries',
            'Brand Voice Calibration',
            'Monthly Performance Report',
            'Full Installation & Setup',
            '1st Month Support Included'
        ]
    },
    supportOptions: [
        {
            id: 'support_basic',
            label: 'Maintenance',
            price: 297,
            interval: 'month',
            description: 'We keep it running. Server uptime and basic API handling.',
            features: ['Server Uptime', 'Bug Fixes']
        },
        {
            id: 'support_growth',
            label: 'Growth Optimization',
            price: 997,
            interval: 'month',
            recommended: true,
            description: 'We improve the brain. Monthly review of chat logs to increase conversion.',
            features: ['Everything in Maintenance', 'Chat Log Audits', 'Conversion Tuning', 'New Feature Priority']
        }
    ],
    upgrades: [
        {
            id: 'cap_whatsapp',
            label: 'Unlock: WhatsApp Integration',
            price: 800,
            type: 'one_time',
            description: 'Deploy the same agent on WhatsApp Business to chat with customers on their phone.'
        },
        {
            id: 'cap_crm',
            label: 'Unlock: CRM Sync',
            price: 500,
            type: 'one_time',
            description: 'Automatically push every lead directly into your CRM (HubSpot, Salesforce, Pipedrive).'
        }
    ]
};
