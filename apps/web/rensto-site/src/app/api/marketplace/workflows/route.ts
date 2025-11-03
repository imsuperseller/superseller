import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Marketplace Workflows API
 * 
 * Fetches workflow products from Airtable Marketplace Products table
 * Returns data formatted for dynamic workflow card rendering
 * 
 * GET /api/marketplace/workflows?category=Email&status=Active
 */

const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base
const MARKETPLACE_PRODUCTS_TABLE = 'tblLO2RJuYJjC806X'; // Marketplace Products table

async function getWorkflowsFromAirtable(filters: {
  category?: string;
  status?: string;
  limit?: number;
}) {
  const AIRTABLE_API_KEY = (process.env.AIRTABLE_API_KEY || '').trim();
  
  if (!AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY not configured');
  }

  let filterFormula = '';
  if (filters.status) {
    filterFormula = `{Status}="${filters.status}"`;
  }
  if (filters.category) {
    if (filterFormula) filterFormula += ' AND ';
    filterFormula += `{Category}="${filters.category}"`;
  }

  try {
    // Sanitize API key to ensure no invalid characters in header
    // Remove all control characters and ensure clean string
    const sanitizedKey = AIRTABLE_API_KEY
      .replace(/[\r\n\t\x00-\x1F\x7F-\x9F]/g, '') // Remove all control chars
      .replace(/\s+/g, '') // Remove all whitespace
      .trim();
    
    if (!sanitizedKey || sanitizedKey.length === 0) {
      throw new Error('AIRTABLE_API_KEY is empty after sanitization');
    }
    
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PRODUCTS_TABLE}`,
      {
        headers: {
          'Authorization': `Bearer ${sanitizedKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          ...(filterFormula && { filterByFormula: filterFormula }),
          maxRecords: filters.limit || 100,
          sort: [{ field: 'Workflow Name', direction: 'asc' }]
        }
      }
    );

    return response.data.records.map((record: any) => {
      const fields = record.fields;
      
      // Calculate pricing tiers based on download price
      const downloadPrice = fields['Download Price'] || 0;
      const installPrice = fields['Install Price'] || 0;
      
      // Determine tier based on price
      let downloadTier = 'simple';
      if (downloadPrice >= 197) downloadTier = 'complete';
      else if (downloadPrice >= 97) downloadTier = 'advanced';
      
      let installTier = 'template';
      if (installPrice >= 3500) installTier = 'custom';
      else if (installPrice >= 1997) installTier = 'system';

      // Extract features
      const features = fields['Features'] || [];
      const featuresText = fields['Features Text'] || '';
      const featureList = Array.isArray(features) ? features : 
                         featuresText ? featuresText.split(/[,\n]/).map((f: string) => f.trim()).filter(Boolean) : [];

      return {
        id: record.id,
        workflowId: fields['Workflow ID'] || fields['Product Catalog ID'] || '',
        name: fields['Workflow Name'] || '',
        category: fields['Category'] || '',
        description: fields['Description'] || '',
        downloadPrice: downloadPrice,
        installPrice: installPrice,
        downloadTier: downloadTier,
        installTier: installTier,
        complexity: fields['Complexity'] || 'Intermediate',
        setupTime: fields['Setup Time'] || '2-4 hours',
        features: featureList.slice(0, 4), // Top 4 features
        targetMarket: fields['Target Market'] || '',
        n8nAffiliateLink: fields['n8n Affiliate Link'] || 'https://tinyurl.com/ym3awuke',
        workflowJsonUrl: fields['Workflow JSON File URL'] || '',
        status: fields['Status'] || 'Active',
        pricingTiers: fields['Pricing Tiers'] || []
      };
    });
  } catch (error: any) {
    console.error('Airtable API error:', error.message);
    throw new Error(`Failed to fetch workflows: ${error.message}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || '✅ Active';
    const limit = parseInt(searchParams.get('limit') || '100');

    const workflows = await getWorkflowsFromAirtable({
      category: category || undefined,
      status: status,
      limit
    });

    return NextResponse.json({
      success: true,
      count: workflows.length,
      workflows,
      filters: {
        category: category || 'all',
        status,
        limit
      }
    });

  } catch (error: any) {
    console.error('Workflows API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch workflows',
        workflows: []
      },
      { status: 500 }
    );
  }
}

