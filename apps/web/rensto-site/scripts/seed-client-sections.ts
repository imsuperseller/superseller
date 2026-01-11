import { getFirestoreAdmin, COLLECTIONS } from '../src/lib/firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedClientData() {
    const db = getFirestoreAdmin();
    console.log('--- Starting Client Data Seed ---');

    const clients = [
        {
            id: 'client_tax4us',
            name: 'Tax4US LLC',
            logoUrl: '/images/logos/logo-tax4us.png',
            showLogoOnLanding: true,
            status: 'active',
            privacySettings: { hideBusinessName: false },
            hebrew: { name: 'Tax4US' },
            testimonials: [
                {
                    language: 'en',
                    author: 'Ben Ginati',
                    role: 'CEO, Tax4US LLC',
                    quote: "The Automated Website Team changed how we handle our site. It's like having a full tech team on standby 24/7.",
                    result: '24/7 Website Support',
                    imageUrl: '/images/testimonials/client-testimonial-ben.jpg',
                    label: 'TAX4US',
                    order: 1
                }
            ]
        },
        {
            id: 'client_ardan',
            name: 'Ardan Management & Engineering',
            logoUrl: '/images/logos/logo-ardan.png',
            showLogoOnLanding: true,
            status: 'active',
            privacySettings: { hideBusinessName: false },
            hebrew: { name: 'ארדן הנדסה' },
            testimonials: [
                {
                    language: 'en',
                    author: 'Aviad Hazout',
                    role: 'CEO, Ardan Management & Engineering',
                    quote: "The project management automations cut our administrative overhead by 40%. Best investment we've made.",
                    result: 'Project Automation',
                    imageUrl: '/images/clients/client-aviad-hazout.jpg',
                    label: 'ARDAN',
                    order: 2
                },
                {
                    language: 'he',
                    author: 'אביעד חזות',
                    role: 'מנכ״ל, ארדן הנדסה וניהול',
                    quote: 'האוטומציות לניהול פרויקטים חתכו את העומס האדמיניסטרטיבי שלנו ב-40%. ההשקעה הכי טובה שעשינו.',
                    result: 'אוטומציית פרויקטים',
                    label: 'ARDAN',
                    order: 1
                }
            ]
        },
        {
            id: 'client_miss_party',
            name: 'Miss Party',
            logoUrl: '/images/logos/logo-miss-party.png',
            showLogoOnLanding: true,
            status: 'active',
            privacySettings: { hideBusinessName: false },
            hebrew: { name: 'מיס פארטי' },
            testimonials: [
                {
                    language: 'en',
                    author: 'Michal Kacher',
                    role: 'CEO, Miss Party',
                    quote: "The systems they built saved me hours of work every single day. The team understood my needs from day one.",
                    result: 'Operations Automation',
                    imageUrl: '/images/testimonials/client-testimonial-ortal.jpg',
                    label: 'MISS PARTY',
                    order: 3
                },
                {
                    language: 'he',
                    author: 'מיכל כחר',
                    role: 'מנכ״לית, Miss Party',
                    quote: 'הצוות הבין את הצרכים שלי מהרגע הראשון. המערכות שהם בנו חסכו לי שעות של עבודה כל יום.',
                    result: 'אוטומציה עסקית',
                    label: 'MISS PARTY',
                    order: 2
                }
            ]
        },
        {
            id: 'client_szender',
            name: 'David Szender',
            logoUrl: '',
            showLogoOnLanding: false,
            status: 'active',
            privacySettings: {
                hideBusinessName: true,
                customLabel: 'CLIENT'
            },
            hebrew: { name: 'דוד סנדר' },
            testimonials: [
                {
                    language: 'en',
                    author: 'David Szender',
                    role: 'David Szender',
                    quote: "Rensto's service made my business smarter. The automations work 24/7 and free me to focus on growth.",
                    result: 'Business Intelligence',
                    imageUrl: '/images/clients/client-aviad-hazout.jpg',
                    label: 'CLIENT',
                    order: 4
                },
                {
                    language: 'he',
                    author: 'דוד סנדר',
                    role: 'דוד סנדר',
                    quote: 'השירות של רנסטו הפך את העסק שלי לחכם יותר. האוטומציות עובדות 24/7 ומשחררות אותי להתמקד בצמיחה.',
                    result: 'בינה עסקית',
                    label: 'CLIENT',
                    order: 3
                }
            ]
        }
    ];

    for (const clientData of clients) {
        const { testimonials, id, ...clientFields } = clientData;

        console.log(`Seeding client: ${clientFields.name}...`);
        await db.collection(COLLECTIONS.CLIENTS).doc(id).set({
            ...clientFields,
            updatedAt: new Date()
        });

        for (const [index, t] of testimonials.entries()) {
            const testimonialId = `${id}_${t.language}_${index}`;
            console.log(`  Seeding testimonial for ${t.language}...`);
            await db.collection(COLLECTIONS.TESTIMONIALS).doc(testimonialId).set({
                ...t,
                clientId: id,
                isActive: true,
                updatedAt: new Date()
            });
        }
    }

    console.log('--- Seeding Complete ---');
}

seedClientData().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
