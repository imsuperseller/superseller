import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rensto Documentation | AI Implementation & API Guides',
    description: 'Comprehensive guides and documentation for the Rensto platform. Learn how to architect, build, and scale your business automation.',
    alternates: {
        canonical: '/docs',
    },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
