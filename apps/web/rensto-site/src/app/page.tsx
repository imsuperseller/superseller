import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
    title: 'Rensto | Build your Autonomous Business Engine',
    description: 'Deploy AI agents that handle sales, support, and operations 24/7. The ultimate automation platform for modern business owners.',
};

export default function Page() {
    return <HomePageClient />;
}
