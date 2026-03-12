import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const brandId = 'hair-approach';

    // 1. Create Brand
    const brand = await prisma.brand.upsert({
        where: { id: brandId },
        update: {
            name: 'Hair Approach by Deanna',
            slug: 'hair-approach',
            primaryColor: '#6B2346',
            accentColor: '#D4919B',
            ctaColor: '#B8860B',
            tagline: 'Your Hair, Your Story',
            fontFamily: 'Playfair Display',
        },
        create: {
            id: brandId,
            name: 'Hair Approach by Deanna',
            slug: 'hair-approach',
            primaryColor: '#6B2346',
            accentColor: '#D4919B',
            ctaColor: '#B8860B',
            tagline: 'Your Hair, Your Story',
            fontFamily: 'Playfair Display',
            userId: 'superseller-admin',
        },
    });

    console.log('Brand created:', brand.id);

    // 2. Create Landing Page (only columns that exist in DB)
    const lp = await prisma.landingPage.upsert({
        where: { slug: 'hair-approach' },
        update: {
            brandId: brand.id,
            heroHeadline: 'Transform Your Look with Expert Hair Care',
            heroSubheadline: 'Personalized styling, coloring, and treatments by Deanna Rozenblum. Book your free consultation today.',
            ctaText: 'Book Free Consultation',
            direction: 'ltr',
            locale: 'en',
            sections: {
                steps: [
                    { title: 'Free Consultation', description: 'Tell us about your hair goals and lifestyle. We listen first to understand exactly what you want.' },
                    { title: 'Personalized Plan', description: 'Deanna creates a custom approach tailored to your hair type, face shape, and personal style.' },
                    { title: 'Expert Transformation', description: 'Sit back and relax while your vision comes to life with premium products and expert technique.' },
                ],
                differentiators: [
                    { title: 'Personalized Approach', description: 'Every client gets a customized plan. No cookie-cutter styles — only looks designed for you.' },
                    { title: 'Premium Products', description: 'We use only professional-grade products to ensure your hair stays healthy and vibrant.' },
                    { title: 'Years of Experience', description: 'Deanna brings extensive expertise in cutting, coloring, and styling for all hair types.' },
                ],
            },
        },
        create: {
            userId: 'superseller-admin',
            slug: 'hair-approach',
            brandId: brand.id,
            heroHeadline: 'Transform Your Look with Expert Hair Care',
            heroSubheadline: 'Personalized styling, coloring, and treatments by Deanna Rozenblum. Book your free consultation today.',
            ctaText: 'Book Free Consultation',
            direction: 'ltr',
            locale: 'en',
            sections: {
                steps: [
                    { title: 'Free Consultation', description: 'Tell us about your hair goals and lifestyle. We listen first to understand exactly what you want.' },
                    { title: 'Personalized Plan', description: 'Deanna creates a custom approach tailored to your hair type, face shape, and personal style.' },
                    { title: 'Expert Transformation', description: 'Sit back and relax while your vision comes to life with premium products and expert technique.' },
                ],
                differentiators: [
                    { title: 'Personalized Approach', description: 'Every client gets a customized plan. No cookie-cutter styles — only looks designed for you.' },
                    { title: 'Premium Products', description: 'We use only professional-grade products to ensure your hair stays healthy and vibrant.' },
                    { title: 'Years of Experience', description: 'Deanna brings extensive expertise in cutting, coloring, and styling for all hair types.' },
                ],
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
