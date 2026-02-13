import ProductPresentation from './ProductPresentation';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { AITableService } from '@/lib/services/AITableService';

interface Props {
    params: Promise<{ id: string }>;
}

async function getDynamicProduct(id: string) {
    const products = await AITableService.getProducts();
    const aitProduct = products.find((p: any) => (p['Product ID'] || p.id) === id);

    if (!aitProduct) return null;

    return {
        id,
        name: aitProduct['Product Name'] || aitProduct.name,
        price: parseInt(aitProduct['Price'] || aitProduct.price) || 0,
        headline: aitProduct['Headline'] || aitProduct.headline || '',
        description: aitProduct['Description'] || aitProduct.description || '',
        status: aitProduct['Status'] || aitProduct.status || 'active',
        stripePriceId: aitProduct['Stripe ID'] || aitProduct.stripePriceId || '',
        n8nWorkflowId: aitProduct['n8n Webhook'] || aitProduct.n8nWorkflowId || '',
        features: aitProduct['features'] || aitProduct.features || [],
        metrics: aitProduct['metrics'] || aitProduct.metrics || [],
        comparisons: aitProduct['comparisons'] || aitProduct.comparisons || [],
        logicMap: aitProduct['logicMap'] || aitProduct.logicMap || [],
        integrations: aitProduct['integrations'] || aitProduct.integrations || [],
        faqs: aitProduct['faqs'] || aitProduct.faqs || []
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getDynamicProduct(id);
    if (!product) return { title: 'Product Not Found | Rensto' };

    return {
        title: `${product.name} | ${product.headline} | Rensto`,
        description: product.description,
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getDynamicProduct(id);
    if (!product) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { icon, ...serializableProduct } = product;

    return <ProductPresentation product={serializableProduct as any} />;
}
