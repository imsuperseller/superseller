import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base
const MARKETPLACE_PRODUCTS_TABLE = 'tblLO2RJuYJjC806X';
const MARKETPLACE_PURCHASES_TABLE = 'tblzxijTsGsDIFSKx';

async function getAirtableRecord(baseId: string, tableId: string, recordId: string) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Airtable API error:', error);
    return null;
  }
}

async function findProductByWorkflowId(workflowId: string) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PRODUCTS_TABLE}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          filterByFormula: `{Workflow ID}='${workflowId}'`,
          maxRecords: 1
        }
      }
    );
    return response.data.records?.[0] || null;
  } catch (error) {
    console.error('Airtable find product error:', error);
    return null;
  }
}

async function updatePurchaseRecord(purchaseRecordId: string, downloadLink: string) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PURCHASES_TABLE}/${purchaseRecordId}`,
      {
        fields: {
          'Download Link': downloadLink,
          'Download Link Expiry': expiresAt.toISOString(),
          'Status': '📥 Download Link Sent',
          'Access Granted': true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Airtable update purchase error:', error);
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

    // Get workflow file URL
    const sourceFile = product.fields?.['Source File'];
    const workflowFileUrl = await getWorkflowFile(templateId, sourceFile);

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
        name: product.fields?.['Workflow Name'],
        workflowId: product.fields?.['Workflow ID'],
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
