import { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Client, Testimonial } from '@/types/firestore';

export const metadata: Metadata = {
    title: 'Rensto | Build your Autonomous Business Engine',
    description: 'Deploy AI agents that handle sales, support, and operations 24/7. The ultimate automation platform for modern business owners.',
};

export const dynamic = 'force-dynamic';

async function getLandingData() {
    const db = getFirestoreAdmin();

    try {
        // Fetch active clients for logos (Industry Leaders)
        // Query only by status to avoid index requirements for multiple where clauses
        const clientsSnap = await db.collection(COLLECTIONS.CLIENTS)
            .where('status', '==', 'active')
            .get();

        const logos = clientsSnap.docs
            .map(doc => {
                const data = doc.data();
                // Strictly select only needed fields to avoid serialization issues
                return {
                    id: doc.id,
                    name: data.name || '',
                    logoUrl: data.logoUrl || '',
                    showLogoOnLanding: data.showLogoOnLanding || false,
                    // Additional safe fields if needed, but avoiding spread of unknown Timestamps
                } as Client;
            })
            .filter(client => client.showLogoOnLanding);

        // Fetch testimonials
        // Query only by isActive to avoid index requirements for order/language combinations
        const testimonialsSnap = await db.collection(COLLECTIONS.TESTIMONIALS)
            .where('isActive', '==', true)
            .get();

        const testimonials = testimonialsSnap.docs
            .map(doc => {
                const data = doc.data();
                // Strictly select only needed fields
                return {
                    id: doc.id,
                    author: data.author || '',
                    role: data.role || '',
                    quote: data.quote || '',
                    result: data.result || '',
                    imageUrl: data.imageUrl || data.image || '', // Handle both field names
                    label: data.label || '',
                    order: data.order || 0,
                    isActive: data.isActive || false,
                    language: data.language || 'en',
                } as Testimonial;
            })
            .filter(t => t.language === 'en')
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        return { logos, testimonials };
    } catch (error) {
        console.error('Error fetching landing data:', error);
        // Fallback to empty arrays during build if Firestore fails
        return { logos: [], testimonials: [] };
    }
}

export default async function Page() {
    const { logos, testimonials } = await getLandingData();

    return <HomePageClient initialLogos={logos} initialTestimonials={testimonials} />;
}
