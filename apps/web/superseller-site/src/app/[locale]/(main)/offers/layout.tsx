import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Special Automation Offers & Audit Plans | SuperSeller AI',
    description: 'Exclusive deals on AI automation systems, process audits, and limited-time consulting offers for scaling businesses.',
    alternates: {
        canonical: '/offers',
    },
};

export default function OffersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
