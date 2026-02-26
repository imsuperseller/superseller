import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'WhatsApp AI Sales Agent & Business OS | SuperSeller AI',
    description: 'Turn your WhatsApp into a high-converting sales machine. Automate lead qualification, bookings, and support with AI.',
    alternates: {
        canonical: '/whatsapp',
    },
};

export default function WhatsAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
