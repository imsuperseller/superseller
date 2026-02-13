import { Metadata } from 'next';
import { AITableService } from '@/lib/services/AITableService';
import HomePageClient from '../HomePageClient';

export const metadata: Metadata = {
    title: 'Rensto | Build your Autonomous Business Engine',
    description: 'Deploy AI agents that handle sales, support, and operations 24/7. The ultimate automation platform for modern business owners.',
};

export const dynamic = 'force-dynamic';

async function getLandingData() {
    try {
        const [logos, testimonials, products] = await Promise.all([
            AITableService.getClients(),
            AITableService.getTestimonials(),
            AITableService.getProducts()
        ]);

        const formattedLogos = logos
            .filter((c: any) => c.Status === 'active')
            .map((c: any) => ({
                id: c.id,
                name: c.name || '',
                logoUrl: c.logoUrl || '',
                showLogoOnLanding: true,
            }));

        const formattedTestimonials = testimonials
            .filter((t: any) => t.Status === 'Active')
            .map((t: any) => ({
                id: t.id,
                author: t.Author || '',
                role: t.Role || '',
                quote: t.Quote || '',
                result: t.Result || '',
                imageUrl: t.ImageUrl || '',
                label: t.Label || '',
                order: parseInt(t.Order) || 0,
            }))
            .sort((a, b) => a.order - b.order);

        return {
            logos: formattedLogos,
            testimonials: formattedTestimonials,
            products: products.filter((p: any) => p.Status !== 'hidden'),
            stats: [
                { value: 'Zero', label: 'Sick Days Taken', icon: 'Shield' }, // Placeholder icon name, handled in client
                { value: '24/7', label: 'Operational Uptime', icon: 'Clock' },
                { value: `${formattedLogos.length}+`, label: 'Active Partners', icon: 'CheckCircle' },
                { value: '∞', label: 'Scalability', icon: 'Zap' }
            ]
        };
    } catch (error) {
        console.error('Error fetching landing data from AITable:', error);
        return { logos: [], testimonials: [], products: [] };
    }
}

export default async function Page() {
    const { logos, testimonials, products } = await getLandingData();

    return (
        <HomePageClient
            initialLogos={logos as any}
            initialTestimonials={testimonials as any}
            initialProducts={products}
        />
    );
}
