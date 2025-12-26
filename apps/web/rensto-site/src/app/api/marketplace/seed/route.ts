import { NextRequest, NextResponse } from 'next/server';
import { AirtableApi } from '@/lib/airtable';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    // Only allow local or authenticated requests if needed
    // In dev, we just run it.

    try {
        const airtable = new AirtableApi();

        // 1. Read the categorization file
        const filePath = path.join(process.cwd(), '../../../workflows/templates-library/WORKFLOW_CATEGORIZATION.md');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Categorization file not found' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        // 2. Parse the markdown tables
        // Simple parser for the specific format in the file
        const lines = content.split('\n');
        const templates: any[] = [];
        let currentCategory = '';

        for (const line of lines) {
            if (line.startsWith('### ')) {
                currentCategory = line.replace('### ', '').split(' (')[0].trim();
            }

            if (line.startsWith('| `')) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 5) {
                    const workflowId = parts[1].replace(/`/g, '');
                    const name = parts[2];
                    const status = parts[3];
                    const tags = parts[4].split(',').map(t => t.replace(/`/g, '').trim()).filter(Boolean);

                    templates.push({
                        workflowId,
                        name,
                        category: currentCategory,
                        status,
                        tags,
                        description: `Rensto ${currentCategory} solution: ${name}`,
                        price: currentCategory === 'Internal Operations' ? 0 : 97, // Default price
                    });
                }
            }
        }

        // 3. Seed Airtable (Batching)
        let count = 0;
        for (const template of templates) {
            try {
                // Check if already exists to avoid dupes (optional, but safer)
                // For seeding, we'll just try to create
                await airtable.createTemplate({
                    name: template.name,
                    description: template.description,
                    category: template.category.toLowerCase().replace(/ /g, '-'),
                    price: template.price,
                    features: template.tags,
                    installation: true,
                    popular: template.status.includes('✅'),
                    version: '1.0.0',
                    content: JSON.stringify({ workflowId: template.workflowId }),
                    fileSize: 15 // kb estimate
                });
                count++;
            } catch (err) {
                console.error(`Failed to seed ${template.name}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${count} workflows to Airtable`,
            totalFound: templates.length
        });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
