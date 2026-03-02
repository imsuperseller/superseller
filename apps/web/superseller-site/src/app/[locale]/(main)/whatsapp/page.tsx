import { Metadata } from 'next';
import { AITableService } from '@/lib/services/AITableService';
import WhatsAppClient from './WhatsAppClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'WhatsApp AI Agent Configurator | SuperSeller AI',
    description: 'Deploy a high-fidelity WhatsApp AI Agent that handles qualification, objection handling, and CRM synchronization with surgical precision.',
};

export default async function WhatsAppPage() {
    const products = await AITableService.getProducts();
    const secretaryProduct = products.find(p => (p['Product ID'] || p.id) === 'autonomous-secretary');

    return <WhatsAppClient initialProduct={secretaryProduct} />;
}
