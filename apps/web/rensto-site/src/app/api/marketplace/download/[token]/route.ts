import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BOOST_SPACE_CONFIG = {
  baseURL: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '',
  marketplaceSpaceId: 51
};

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/imsuperseller/rensto/main';

async function getPurchaseRecord(orderId: string) {
  try {
    const apiKey = BOOST_SPACE_CONFIG.apiKey.trim();
    if (!apiKey) {
      throw new Error('BOOST_SPACE_API_KEY not configured');
    }

    // TODO: Use Boost.space Orders API when available
    // For now, fallback to checking if order exists via Notes or metadata
    // This is a placeholder - actual implementation depends on Boost.space Orders API
    
    return null; // Orders API not yet implemented
  } catch (error: any) {
    console.error('Boost.space get purchase error:', error.message);
    return null;
  }
}

async function updateDownloadCount(orderId: string) {
  try {
    // TODO: Update download count in Boost.space Order when Orders API is available
    // For now, this is a no-op
    console.log(`Download count updated for order: ${orderId}`);
  } catch (error: any) {
    console.error('Update download count error:', error.message);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Download token required' },
        { status: 400 }
      );
    }

    // Decode token to get purchase record ID
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [purchaseRecordId, customerEmail, timestamp] = decoded.split(':');

    if (!purchaseRecordId) {
      return NextResponse.json(
        { success: false, error: 'Invalid download token' },
        { status: 400 }
      );
    }

    // Get purchase record (order) from Boost.space
    // TODO: Implement when Boost.space Orders API is available
    // For now, extract workflowId from token metadata or use fallback
    
    // Extract workflowId from purchaseRecordId if it contains it
    // Otherwise, we'll need to query Boost.space Orders API
    const workflowId = purchaseRecordId.split('-')[0] || 'unknown';
    
    // Get product from Boost.space
    const apiKey = BOOST_SPACE_CONFIG.apiKey.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BOOST_SPACE_API_KEY not configured' },
        { status: 500 }
      );
    }

    let product = null;
    try {
      const productResponse = await axios.get(
        `${BOOST_SPACE_CONFIG.baseURL}/api/product`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            spaceId: BOOST_SPACE_CONFIG.marketplaceSpaceId
          },
          timeout: 10000
        }
      );

      const products = Array.isArray(productResponse.data) ? productResponse.data : productResponse.data.items || [];
      product = products.find((p: any) => 
        (p.sku && p.sku === workflowId) || 
        (p.metadata?.workflowId && p.metadata.workflowId === workflowId)
      );
    } catch (error: any) {
      console.error('Boost.space get product error:', error.message);
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const sourceFile = product.metadata?.sourceFile || product.sourceFile;
    const workflowFileUrl = product.metadata?.workflowJsonUrl || product.workflowJsonUrl;

    // Determine file path
    let filePath = workflowFileUrl || sourceFile || `workflows/templates/${workflowId}.json`;
    
    // If it's a GitHub URL, redirect to it
    if (filePath.startsWith('http')) {
      // Update download count
      await updateDownloadCount(purchaseRecordId);
      
      // Redirect to GitHub raw URL
      return NextResponse.redirect(filePath);
    }

    // If local file path, try to read from repo (in production, use GitHub)
    // For now, redirect to GitHub
    const githubUrl = filePath.startsWith('workflows/') 
      ? `${GITHUB_RAW_BASE}/${filePath}`
      : `${GITHUB_RAW_BASE}/workflows/${filePath}`;

    // Update download count
    await updateDownloadCount(purchaseRecordId);

    // Redirect to GitHub raw file
    return NextResponse.redirect(githubUrl);

  } catch (error: any) {
    console.error('Download token error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process download' },
      { status: 500 }
    );
  }
}

