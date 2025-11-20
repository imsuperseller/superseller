import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Marketplace Workflows API - Boost.space Version
 * 
 * Fetches workflow products from Boost.space Products module
 * Falls back to Airtable if Boost.space unavailable
 * 
 * GET /api/marketplace/workflows?source=boost-space&category=Email&status=Active
 */

const BOOST_SPACE_CONFIG = {
  baseURL: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '',
  marketplaceSpaceId: 51
};

async function getWorkflowsFromBoostSpace(filters: {
  category?: string;
  status?: string;
  limit?: number;
}) {
  const apiKey = BOOST_SPACE_CONFIG.apiKey.trim();
  
  if (!apiKey) {
    throw new Error('BOOST_SPACE_API_KEY not configured');
  }

  try {
    // Query Boost.space Products module
    const response = await axios.get(
      `${BOOST_SPACE_CONFIG.baseURL}/api/product`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          spaceId: BOOST_SPACE_CONFIG.marketplaceSpaceId,
          limit: filters.limit || 100
        },
        timeout: 10000
      }
    );

    let products = response.data;
    
    // Filter by category/status if needed (Boost.space may handle this differently)
    if (filters.category) {
      products = products.filter((p: any) => 
        p.metadata?.category === filters.category
      );
    }
    
    if (filters.status) {
      products = products.filter((p: any) => 
        p.metadata?.status === filters.status
      );
    }

    // Transform Boost.space Products to workflow format
    return products.map((product: any) => ({
      id: product.id,
      workflowId: product.metadata?.workflowId || '',
      name: product.name,
      category: product.metadata?.category || '',
      description: product.description || '',
      downloadPrice: product.unit_price ? product.unit_price / 100 : 0, // Convert from cents
      installPrice: product.metadata?.installPrice || 0,
      downloadTier: product.metadata?.downloadTier || 'simple',
      installTier: product.metadata?.installTier || 'template',
      complexity: product.metadata?.complexity || 'Intermediate',
      setupTime: product.metadata?.setupTime || '2-4 hours',
      features: product.metadata?.features || [],
      targetMarket: product.metadata?.targetMarket || '',
      n8nAffiliateLink: product.metadata?.n8nAffiliateLink || 'https://tinyurl.com/ym3awuke',
      workflowJsonUrl: product.metadata?.workflowJsonUrl || '',
      status: product.metadata?.status || 'Active',
      pricingTiers: product.metadata?.pricingTiers || []
    }));
    
  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { status?: number } };
    
    if (axiosError.response?.status === 401) {
      throw new Error('Boost.space API key is invalid or expired.');
    }
    
    throw new Error(`Failed to fetch workflows from Boost.space: ${axiosError.message || 'Unknown error'}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'airtable'; // Default to Airtable for now
    const category = searchParams.get('category');
    const status = searchParams.get('status') || '✅ Active';
    const limit = parseInt(searchParams.get('limit') || '100');

    let workflows;
    
    if (source === 'boost-space') {
      workflows = await getWorkflowsFromBoostSpace({
        category: category || undefined,
        status: status,
        limit
      });
    } else {
      // Fallback to Airtable (existing implementation)
      // Import from existing route.ts
      throw new Error('Use /api/marketplace/workflows for Airtable source');
    }

    return NextResponse.json({
      success: true,
      source: 'boost-space',
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

