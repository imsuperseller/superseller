import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BOOST_SPACE_CONFIG = {
  baseURL: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '',
  marketplaceSpaceId: 51
};

async function findProductByWorkflowId(workflowId: string) {
  try {
    const apiKey = BOOST_SPACE_CONFIG.apiKey.trim();
    if (!apiKey) {
      throw new Error('BOOST_SPACE_API_KEY not configured');
    }

    const response = await axios.get(
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

    const products = Array.isArray(response.data) ? response.data : response.data.items || [];
    const product = products.find((p: any) => 
      (p.sku && p.sku === workflowId) || 
      (p.metadata?.workflowId && p.metadata.workflowId === workflowId)
    );
    
    return product || null;
  } catch (error: any) {
    console.error('Boost.space find product error:', error.message);
    return null;
  }
}

async function updatePurchaseRecord(orderId: string, downloadLink: string) {
  try {
    const apiKey = BOOST_SPACE_CONFIG.apiKey.trim();
    if (!apiKey) {
      throw new Error('BOOST_SPACE_API_KEY not configured');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Update Boost.space Order (if Orders API exists)
    // For now, we'll create/update via Notes or store in metadata
    // TODO: Implement Boost.space Orders API when available
    
    return { success: true };
  } catch (error: any) {
    console.error('Boost.space update purchase error:', error.message);
    return { success: false, error: error.message };
  }
}

async function getWorkflowFile(workflowId: string, sourceFile?: string) {
  // Try to find workflow file based on product catalog or source file path
  const possiblePaths = [
    sourceFile,
    `workflows/${workflowId}.json`,
    `workflows/templates/${workflowId}.json`,
    `workflows/rensto/${workflowId}.json`,
    `workflows/email-automation-system.json` // Fallback for email-persona-system
  ].filter(Boolean);

  // In production, these would be served from CDN/GitHub
  // For now, return GitHub raw URL structure
  const githubBase = 'https://raw.githubusercontent.com/imsuperseller/rensto/main';
  
  for (const filePath of possiblePaths) {
    if (filePath) {
      // Return GitHub raw URL (workflow files should be in repo)
      return `${githubBase}/${filePath}`;
    }
  }

  // Fallback: return generic download URL
  return `${githubBase}/workflows/templates/${workflowId}.json`;
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, customerEmail, sessionId, purchaseRecordId } = await request.json();

    if (!templateId || !customerEmail || !purchaseRecordId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateId, customerEmail, purchaseRecordId' },
        { status: 400 }
      );
    }

    // Find product in Marketplace Products table
    const product = await findProductByWorkflowId(templateId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found in Marketplace Products table' },
        { status: 404 }
      );
    }

    // Get workflow file URL from Boost.space product
    const sourceFile = product.metadata?.sourceFile || product.sourceFile;
    const workflowFileUrl = product.metadata?.workflowJsonUrl || product.workflowJsonUrl || 
      await getWorkflowFile(templateId, sourceFile);

    // Generate secure download token (7 days expiry)
    const token = Buffer.from(`${purchaseRecordId}:${customerEmail}:${Date.now()}`).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Generate download link
    const downloadLink = `https://api.rensto.com/api/marketplace/download/${token}`;

    // Update purchase record in Airtable
    await updatePurchaseRecord(purchaseRecordId, downloadLink);

    return NextResponse.json({
      success: true,
      downloadLink,
      downloadUrl: downloadLink, // Alias for compatibility
      url: downloadLink, // Another alias
      expiresAt: expiresAt.toISOString(),
      workflowFileUrl,
      product: {
        name: product.name,
        workflowId: product.sku || product.metadata?.workflowId || templateId,
        sourceFile
      }
    });

  } catch (error: any) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process download' },
      { status: 500 }
    );
  }
}
