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
    
    // Validate key format (Airtable PATs start with 'patt' or 'pat' and are ~120 chars)
    const isValidFormat = sanitizedKey.startsWith('patt') || sanitizedKey.startsWith('pat');
    if (!isValidFormat || sanitizedKey.length < 50) {
      console.error('Airtable API key format invalid:', {
        startsWith: sanitizedKey.substring(0, 4),
        length: sanitizedKey.length,
        preview: sanitizedKey.substring(0, 20) + '...'
      });
      // Don't throw - let Airtable API reject it for better error message
    }
    
    // Build Authorization header with proper encoding
    const authHeader = `Bearer ${sanitizedKey}`;
    
    // Validate header doesn't contain invalid characters
    if (/[\r\n]/.test(authHeader)) {
      throw new Error('Authorization header contains invalid characters after sanitization');
    }
    
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PRODUCTS_TABLE}`,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        params: {
          ...(filterFormula && { filterByFormula: filterFormula }),
          maxRecords: filters.limit || 100,
          sort: [{ field: 'Workflow Name', direction: 'asc' }]
        },
        // Add timeout and retry logic for rate limits
        timeout: 10000,
        validateStatus: (status) => status < 500 // Don't throw on 429
      }
    );
    
    // Handle rate limiting gracefully
    if (response.status === 429) {
      const retryAfter = response.headers['retry-after'] || '60';
      throw new Error(`Airtable rate limit exceeded. Please retry after ${retryAfter} seconds.`);
    }

    return response.data.records.map((record: { id: string; fields: Record<string, unknown> }) => {
      const fields = record.fields;
      
      // Calculate pricing tiers based on download price
      const downloadPrice = (typeof fields['Download Price'] === 'number' ? fields['Download Price'] : 0) as number;
      const installPrice = (typeof fields['Install Price'] === 'number' ? fields['Install Price'] : 0) as number;
      
      // Determine tier based on price
      let downloadTier = 'simple';
      if (downloadPrice >= 197) downloadTier = 'complete';
      else if (downloadPrice >= 97) downloadTier = 'advanced';
      
      let installTier = 'template';
      if (installPrice >= 3500) installTier = 'custom';
      else if (installPrice >= 1997) installTier = 'system';

      // Extract features
      const features = fields['Features'] || [];
      const featuresText = (typeof fields['Features Text'] === 'string' ? fields['Features Text'] : '') as string;
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
  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { status?: number; statusText?: string; data?: unknown } };
    
    console.error('Airtable API error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data
    });
    
    // Provide more helpful error messages
    if (axiosError.response?.status === 429) {
      throw new Error('Airtable rate limit exceeded. Please try again in a few moments.');
    } else if (axiosError.response?.status === 401) {
      throw new Error('Airtable API key is invalid or expired.');
    } else if (axiosError.response?.status === 404) {
      throw new Error('Airtable base or table not found. Please verify configuration.');
    } else if (axiosError.message?.includes('Invalid character')) {
      throw new Error('API key contains invalid characters. Please check environment variable.');
    }
    
    throw new Error(`Failed to fetch workflows: ${axiosError.message || 'Unknown error'}`);
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Workflows API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        workflows: []
      },
      { status: 500 }
    );
  }
}

