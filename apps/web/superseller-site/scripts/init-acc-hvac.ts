import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const brandId = 'acc-hvac';

    // 1. Create Brand
    const brand = await prisma.brand.upsert({
        where: { id: brandId },
        update: {
            name: 'AC&C Heating & Cooling',
            slug: 'acc-hvac',
            primaryColor: '#111827',
            accentColor: '#4A75B0',
            ctaColor: '#4A75B0',
            tagline: 'Professional HVAC & Chimney Services in Dallas-Fort Worth',
            fontFamily: 'Outfit',
            logoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        },
        create: {
            id: brandId,
            name: 'AC&C Heating & Cooling',
            slug: 'acc-hvac',
            primaryColor: '#111827',
            accentColor: '#4A75B0',
            ctaColor: '#4A75B0',
            tagline: 'Professional HVAC & Chimney Services in Dallas-Fort Worth',
            fontFamily: 'Outfit',
            logoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
            userId: 'superseller-admin',
        },
    });

    console.log('Brand created:', brand.id);

    // 2. Create Landing Page
    const lp = await prisma.landingPage.upsert({
        where: { slug: 'acc-hvac' },
        update: {
            brandId: brand.id,
            heroHeadline: 'Professional HVAC & Chimney Services in Dallas, TX',
            heroSubheadline: 'Our skilled professionals specialize in chimney sweeping, fireplace services, and HVAC work. Family-owned business serving Dallas area homeowners.',
            ctaText: 'Schedule Service',
            phone: '(469) 998-9198',
            whatsappNumber: '14699989198',
            direction: 'ltr',
            locale: 'en',
            sections: {
                steps: [
                    { title: 'Chimney Sweeping', description: 'Professional cleaning to remove creosote buildup, ensuring your chimney is safe and efficient.' },
                    { title: 'Fireplace Repair', description: 'Expert repairs for gas, wood, and electric fireplaces to keep your home warm and cozy.' },
                    { title: 'AC Installation & Repair', description: 'Stay cool during Texas summers with our reliable air conditioning services and tune-ups.' }
                ],
                testimonials: [
                    { name: 'Sarah M.', content: 'Neitha and her team did an amazing job cleaning our chimney! Very professional and thorough work. Highly recommend AC&C LLC for any HVAC needs.' },
                    { name: 'Mike D.', content: 'Quick response for our AC emergency. Fair pricing and excellent service from AC&C LLC. They really know their stuff!' }
                ],
                differentiators: [
                    { title: 'Licensed & Insured', description: 'Our certified technicians are fully licensed and insured for your peace of mind.' },
                    { title: 'Emergency Service', description: 'Available 24/7 for urgent HVAC repairs when you need us most.' },
                    { title: 'Family Owned', description: 'Personalized service from a local family-owned business serving DFW since 1998.' }
                ]
            },
        },
        create: {
            userId: 'superseller-admin',
            slug: 'acc-hvac',
            brandId: brand.id,
            heroHeadline: 'Professional HVAC & Chimney Services in Dallas, TX',
            heroSubheadline: 'Our skilled professionals specialize in chimney sweeping, fireplace services, and HVAC work. Family-owned business serving Dallas area homeowners.',
            ctaText: 'Schedule Service',
            phone: '(469) 998-9198',
            whatsappNumber: '14699989198',
            direction: 'ltr',
            locale: 'en',
            sections: {
                steps: [
                    { title: 'Chimney Sweeping', description: 'Professional cleaning to remove creosote buildup, ensuring your chimney is safe and efficient.' },
                    { title: 'Fireplace Repair', description: 'Expert repairs for gas, wood, and electric fireplaces to keep your home warm and cozy.' },
                    { title: 'AC Installation & Repair', description: 'Stay cool during Texas summers with our reliable air conditioning services and tune-ups.' }
                ],
                testimonials: [
                    { name: 'Sarah M.', content: 'Neitha and her team did an amazing job cleaning our chimney! Very professional and thorough work. Highly recommend AC&C LLC for any HVAC needs.' },
                    { name: 'Mike D.', content: 'Quick response for our AC emergency. Fair pricing and excellent service from AC&C LLC. They really know their stuff!' }
                ],
                differentiators: [
                    { title: 'Licensed & Insured', description: 'Our certified technicians are fully licensed and insured for your peace of mind.' },
                    { title: 'Emergency Service', description: 'Available 24/7 for urgent HVAC repairs when you need us most.' },
                    { title: 'Family Owned', description: 'Personalized service from a local family-owned business serving DFW since 1998.' }
                ]
            },
        },
    });

    console.log('Landing Page created:', lp.slug);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
