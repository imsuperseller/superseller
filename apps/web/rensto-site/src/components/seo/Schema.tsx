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
    sameAs: [
        'https://twitter.com/rensto',
        'https://www.linkedin.com/company/rensto-llc',
        'https://instagram.com/myrensto',
        'https://facebook.com/myrensto'
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        'telephone': '+1-234-567-890', // Placeholder
        'contactType': 'customer service',
        'email': 'hello@rensto.com'
    }
};

export const localBusinessSchema = {
    name: 'Rensto AI Automation',
    image: 'https://rensto.com/rensto-logo.webp',
    '@id': 'https://rensto.com',
    url: 'https://rensto.com',
    telephone: '+1-234-567-890',
    address: {
        '@type': 'PostalAddress',
        'streetAddress': '123 Automation Way',
        'addressLocality': 'San Francisco',
        'addressRegion': 'CA',
        'postalCode': '94103',
        'addressCountry': 'US'
    },
    geo: {
        '@type': 'GeoCoordinates',
        'latitude': 37.7749,
        'longitude': -122.4194
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday'
        ],
        'opens': '09:00',
        'closes': '18:00'
    }
};

export const websiteSchema = {
    name: 'Rensto',
    url: 'https://rensto.com',
    potentialAction: {
        '@type': 'SearchAction',
        'target': 'https://rensto.com/marketplace?q={search_term_string}',
        'query-input': 'required name=search_term_string'
    },
    // AEO: Speakable schema for Voice AI (Gemini Live / Siri / Alexa)
    speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.hero-title', '.hero-description', '.service-tagline']
    }
};

export const serviceSchemas = {
    starter: {
        name: 'Starter Care Plan',
        description: 'Monthly automation monitoring and support. 5 hours monthly.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '497.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    },
    growth: {
        name: 'Growth Care Plan',
        description: 'Advanced automation optimization and priority support. 15 hours monthly.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '997.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    },
    scale: {
        name: 'Scale Care Plan',
        description: 'Enterprise-grade automation engineering and strategic planning. 40 hours monthly.',
        provider: { '@type': 'Organization', name: 'Rensto' },
        offers: {
            '@type': 'Offer',
            price: '2497.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        }
    }
};
