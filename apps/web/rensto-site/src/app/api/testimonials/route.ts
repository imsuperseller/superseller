import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Boost.space Configuration
const BOOST_SPACE_API_KEY = process.env.BOOST_SPACE_API_KEY;
const BOOST_SPACE_API_URL = 'https://superseller.boost.space/api';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    result: string;
}

// Fallback testimonials if Boost.space is unavailable
const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        quote: "Rensto transformed our lead management process. What used to take 3 hours daily now happens automatically in minutes.",
        author: "Michael Chen",
        role: "Operations Director",
        company: "Premier HVAC Services",
        rating: 5,
        result: "Saved 15hrs/week"
    },
    {
        quote: "The custom Voice AI agent handles our appointment scheduling flawlessly. Our booking rate increased by 40% in the first month.",
        author: "Sarah Martinez",
        role: "Practice Manager",
        company: "Wellness Dental Group",
        rating: 5,
        result: "+40% bookings"
    },
    {
        quote: "Best investment we've made. The automation system paid for itself in 6 weeks and continues to save us thousands monthly.",
        author: "David Thompson",
        role: "CEO",
        company: "Thompson Insurance Agency",
        rating: 5,
        result: "6-week ROI"
    }
];

export async function GET() {
    try {
        if (!BOOST_SPACE_API_KEY) {
            console.warn('Boost.space API key not configured, using fallback testimonials');
            return NextResponse.json({ testimonials: FALLBACK_TESTIMONIALS });
        }

        // Fetch testimonials from Boost.space note module (Space 45)
        // Testimonials are stored as notes with specific labels
        const response = await fetch(`${BOOST_SPACE_API_URL}/note?spaces=45&labels=testimonial,active`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BOOST_SPACE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Boost.space API error: ${response.status}`);
        }

        const data = await response.json();

        // Parse testimonials from notes
        const testimonials: Testimonial[] = data.items?.map((note: any) => {
            try {
                // Parse note description which contains testimonial data in markdown format
                const lines = note.note?.split('\n') || [];
                const testimonial: Partial<Testimonial> = {};

                lines.forEach((line: string) => {
                    if (line.startsWith('**Quote**:')) testimonial.quote = line.replace('**Quote**:', '').trim();
                    if (line.startsWith('**Author**:')) testimonial.author = line.replace('**Author**:', '').trim();
                    if (line.startsWith('**Role**:')) testimonial.role = line.replace('**Role**:', '').trim();
                    if (line.startsWith('**Company**:')) testimonial.company = line.replace('**Company**:', '').trim();
                    if (line.startsWith('**Rating**:')) testimonial.rating = parseInt(line.replace('**Rating**:', '').trim());
                    if (line.startsWith('**Result**:')) testimonial.result = line.replace('**Result**:', '').trim();
                });

                return testimonial as Testimonial;
            } catch (error) {
                console.error('Error parsing testimonial:', error);
                return null;
            }
        }).filter(Boolean) || [];

        // If no testimonials found in Boost.space, use fallback
        if (testimonials.length === 0) {
            console.warn('No testimonials found in Boost.space, using fallback');
            return NextResponse.json({ testimonials: FALLBACK_TESTIMONIALS });
        }

        return NextResponse.json({ testimonials });

    } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Return fallback testimonials on error
        return NextResponse.json({ testimonials: FALLBACK_TESTIMONIALS });
    }
}
