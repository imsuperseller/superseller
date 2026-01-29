import { PRODUCT_REGISTRY } from '@/lib/registry/ProductRegistry';
import ProductPresentation from './ProductPresentation';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = PRODUCT_REGISTRY[id];
    if (!product) return { title: 'Product Not Found | Rensto' };

    return {
        title: `${product.name} | ${product.headline} | Rensto`,
        description: product.description,
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = PRODUCT_REGISTRY[id];
    if (!product) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { icon, ...serializableProduct } = product;

    return <ProductPresentation product={serializableProduct as any} />;
}
