import { Metadata } from 'next';
import nicheEngineData from '@/data/niche_engine.json';

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const niche = nicheEngineData.find((n) => n.slug === slug);

    return {
        title: niche ? `${niche.title} | SuperSeller AI` : 'Industry Automation',
        description: niche ? niche.hero.headline : 'AI-powered business automation.',
        alternates: {
            canonical: `/niches/${slug}`,
        },
    };
}

export default function NicheSlugLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
