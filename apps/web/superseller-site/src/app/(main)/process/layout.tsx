import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Proven Automation Process | SuperSeller AI Business System',
    description: 'Understand how we architect and build your business automation infrastructure in days, not months. Our 5-stage rapid deployment model.',
    alternates: {
        canonical: '/process',
    },
};

export default function ProcessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
