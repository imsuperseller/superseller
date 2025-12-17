import { NextRequest, NextResponse } from 'next/server';
import { LITAL_PRICING_CONFIG } from '@/config/lital-pricing';

const ESIGNATURES_API_KEY = process.env.ESIGNATURES_API_KEY;
const ESIGNATURES_TEMPLATE_ID = process.env.ESIGNATURES_TEMPLATE_ID;

export async function POST(req: NextRequest) {
    if (!ESIGNATURES_API_KEY || !ESIGNATURES_TEMPLATE_ID) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { signerName, signerEmail, packageName, price, customFeatures } = body;

        if (!signerName || !signerEmail) {
            return NextResponse.json({ error: 'Missing signer details' }, { status: 400 });
        }

        // Build Dynamic Scope of Work
        let scopeDescription = `Base Platform: ${LITAL_PRICING_CONFIG.base.label}\n`;

        // Helper to find in any category
        const findFeature = (id: string) => {
            if (id === LITAL_PRICING_CONFIG.base.id) return null; // Already added base
            const support = LITAL_PRICING_CONFIG.supportOptions.find(o => o.id === id);
            if (support) return { ...support, category: 'Monthly Support' };
            const upgrade = LITAL_PRICING_CONFIG.upgrades.find(u => u.id === id);
            if (upgrade) return { ...upgrade, category: 'One-Time Upgrade' };
            return null;
        };

        if (Array.isArray(customFeatures)) {
            customFeatures.forEach(id => {
                const item = findFeature(id);
                if (item) {
                    scopeDescription += `+ ${item.category}: ${item.label}\n`;
                }
            });
        }

        // Prepare contract request
        const response = await fetch('https://esignatures.com/api/contracts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(ESIGNATURES_API_KEY + ':').toString('base64')}`
            },
            body: JSON.stringify({
                template_id: ESIGNATURES_TEMPLATE_ID,
                title: `Service Agreement - ${packageName || 'Custom Plan'}`,
                metadata: {
                    packageName,
                    price: String(price)
                },
                signers: [
                    {
                        name: signerName,
                        email: signerEmail
                    }
                ],
                custom_fields: [
                    {
                        name: 'price',
                        value: `$${Number(price).toLocaleString()}`
                    },
                    {
                        name: 'scope_of_work',
                        value: scopeDescription
                    },
                    {
                        name: 'package_name',
                        value: packageName
                    }
                ],
                // Test mode?
                test: process.env.NODE_ENV !== 'production' ? 'yes' : 'no'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('eSignatures API Error:', result);
            return NextResponse.json({ error: 'Failed to create contract', details: result }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            contractId: result.data?.contract?.id,
            message: 'Contract sent successfully'
        });

    } catch (error) {
        console.error('Contract API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
