import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact SuperSeller AI | AI Automation Experts & Consultation',
    description: 'Get in touch with our team to discuss your business automation needs. Expert guidance on AI agents, workflow optimization, and custom infrastructure.',
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
