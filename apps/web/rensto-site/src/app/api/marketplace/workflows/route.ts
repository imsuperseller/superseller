import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Marketplace Workflows API - Boost.space Version
 * 
 * Fetches workflow products from Boost.space Products module (Space 51)
 * Returns data formatted for dynamic workflow card rendering
 * 
 * GET /api/marketplace/workflows?category=Email&status=Active
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

    let products = Array.isArray(response.data) ? response.data : response.data.items || [];
    
    // Filter by category/status if needed
    if (filters.category) {
      products = products.filter((p: any) => 
        p.category === filters.category || p.metadata?.category === filters.category
      );
    }
    
    if (filters.status) {
      // Handle both "Active" and "✅ Active" status formats
      const statusMatch = filters.status.replace('✅ ', '').toLowerCase();
      products = products.filter((p: any) => {
        const productStatus = (p.status || p.metadata?.status || 'Active').toString().toLowerCase();
        return productStatus === statusMatch || productStatus === 'active';
      });
    }

    // Transform Boost.space Products to workflow format
    return products.map((product: any) => {
      const downloadPrice = product.unit_price ? product.unit_price / 100 : 0; // Convert from cents
      const installPrice = product.metadata?.installPrice || product.installPrice || 0;
      
      // Determine tier based on price
      let downloadTier = 'simple';
      if (downloadPrice >= 197) downloadTier = 'complete';
      else if (downloadPrice >= 97) downloadTier = 'advanced';
      
      let installTier = 'template';
      if (installPrice >= 3500) installTier = 'custom';
      else if (installPrice >= 1997) installTier = 'system';

      // Extract features
      const features = product.metadata?.features || product.features || [];
      const featureList = Array.isArray(features) ? features : 
                         (typeof features === 'string' ? features.split(/[,\n]/).map((f: string) => f.trim()).filter(Boolean) : []);

      return {
        id: product.id,
        workflowId: product.metadata?.workflowId || product.workflowId || product.sku || '',
        name: product.name || 'Unnamed Product',
        category: product.metadata?.category || product.category || '',
        description: product.description || '',
        downloadPrice: downloadPrice,
        installPrice: installPrice,
        downloadTier: downloadTier,
        installTier: installTier,
        complexity: product.metadata?.complexity || product.complexity || 'Intermediate',
        setupTime: product.metadata?.setupTime || product.setupTime || '2-4 hours',
        features: featureList.slice(0, 4), // Top 4 features
        targetMarket: product.metadata?.targetMarket || product.targetMarket || '',
        n8nAffiliateLink: product.metadata?.n8nAffiliateLink || product.n8nAffiliateLink || 'https://tinyurl.com/ym3awuke',
        workflowJsonUrl: product.metadata?.workflowJsonUrl || product.workflowJsonUrl || '',
        status: product.metadata?.status || product.status || 'Active',
        pricingTiers: product.metadata?.pricingTiers || product.pricingTiers || []
      };
    });
    
  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { status?: number } };
    
    console.error('Boost.space API error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response
    });
    
    if (axiosError.response?.status === 401) {
      throw new Error('Boost.space API key is invalid or expired.');
    } else if (axiosError.response?.status === 404) {
      throw new Error('Boost.space Products module not found. Please verify configuration.');
    }
    
    throw new Error(`Failed to fetch workflows from Boost.space: ${axiosError.message || 'Unknown error'}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'Active';
    const limit = parseInt(searchParams.get('limit') || '100');

    const workflows = await getWorkflowsFromBoostSpace({
      category: category || undefined,
      status: status,
      limit
    });

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

