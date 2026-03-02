import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Industry-Specific AI Automation Systems | SuperSeller AI Hub',
    description: 'Explore pre-configured automation systems tailored for your specific industry niche. Real Estate, Dental, Legal, and more.',
    alternates: {
        canonical: '/niches',
    },
};

export default function NichesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
