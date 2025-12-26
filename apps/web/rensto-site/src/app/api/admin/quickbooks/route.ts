import { NextResponse } from 'next/server';
import { QuickBooksApi } from '@/lib/quickbooks';

export async function GET() {
    try {
        const qb = new QuickBooksApi();
        const summary = await qb.getFinancialSummary();

        if (!summary.success) {
            return NextResponse.json({ error: summary.error }, { status: 500 });
        }

        return NextResponse.json(summary);
    } catch (error) {
        console.error('QuickBooks API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
