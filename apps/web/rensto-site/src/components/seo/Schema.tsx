'use client';

import React from 'react';

interface SchemaProps {
    type: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Product' | 'FAQPage' | 'HowTo' | 'BreadcrumbList' | 'Service';
    data: any;
}

export function Schema({ type, data }: SchemaProps) {
    const schemaData = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}

// Pre-defined JSON-LD data for Rensto
export const organizationSchema = {
    name: 'Rensto',
    url: 'https://rensto.com',
    logo: 'https://rensto.com/rensto-logo.webp',
    description: 'Six AI agents that produce videos, answer calls, generate leads, create content, and run your knowledge base — starting at $299/mo.',
    sameAs: [
        'https://twitter.com/rensto',
        'https://www.linkedin.com/company/rensto-llc',
        'https://instagram.com/myrensto',
        'https://facebook.com/myrensto'
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'email': 'hello@rensto.com'
    }
};

export const websiteSchema = {
    name: 'Rensto',
    url: 'https://rensto.com',
    description: 'Your AI Crew for Business — six specialized agents starting at $299/mo.',
};

export const serviceSchemas = {
    starter: {
        name: 'Starter Plan — 500 Credits',
        description: 'AI crew access with 500 monthly credits. Use on any combination of video production, AI receptionist, lead generation, social content, and knowledge queries.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '299.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    },
    pro: {
        name: 'Pro Plan — 1,500 Credits',
        description: 'AI crew access with 1,500 monthly credits. Best for growing businesses that need daily video, calls, and content.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '699.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    },
    enterprise: {
        name: 'Enterprise Plan — 4,000 Credits',
        description: 'AI crew access with 4,000 monthly credits. Full-scale automation for teams and agencies.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '1499.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    }
};
