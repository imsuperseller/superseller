import type { Metadata } from 'next';
import CustomSolutionsPage from './ClientPage';

export const metadata: Metadata = {
    title: 'Custom AI Infrastructure & Bespoke Automation | Rensto',
    description: 'Architect your business empire with tailored AI systems. We build unique infrastructure for complex operational needs.',
    alternates: {
        canonical: '/custom',
    },
};

export default function Page() {
    return <CustomSolutionsPage />;
}
