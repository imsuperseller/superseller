import { AITableService } from '@/lib/services/AITableService';
import FulfillmentQueueClient from './FulfillmentQueueClient';

export const dynamic = 'force-dynamic';

export default async function FulfillmentQueuePage() {
    const products = await AITableService.getProducts();

    return (
        <FulfillmentQueueClient initialProducts={products} />
    );
}
