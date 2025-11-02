import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO';
const MARKETPLACE_PURCHASES_TABLE = 'tblzxijTsGsDIFSKx';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/imsuperseller/rensto/main';

async function getPurchaseRecord(purchaseRecordId: string) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PURCHASES_TABLE}/${purchaseRecordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

async function updateDownloadCount(purchaseRecordId: string) {
  try {
    const purchase = await getPurchaseRecord(purchaseRecordId);
    if (!purchase) return;

    const currentCount = purchase.fields?.['Download Count'] || 0;
    const newCount = currentCount + 1;

    await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MARKETPLACE_PURCHASES_TABLE}/${purchaseRecordId}`,
      {
        fields: {
          'Download Count': newCount,
          'Last Downloaded': new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Update download count error:', error);
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

    // Get purchase record
    const purchase = await getPurchaseRecord(purchaseRecordId);
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase record not found' },
        { status: 404 }
      );
    }

    // Check if download link expired
    const expiryDate = purchase.fields?.['Download Link Expiry'];
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Download link expired' },
        { status: 410 }
      );
    }

    // Get product to find workflow file
    const productLink = purchase.fields?.['Product'];
    if (!productLink || !Array.isArray(productLink) || productLink.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not linked to purchase' },
        { status: 400 }
      );
    }

    const productId = productLink[0]; // Get first linked product
    const productResponse = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tblLO2RJuYJjC806X/${productId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const product = productResponse.data;
    const workflowId = product.fields?.['Workflow ID'];
    const sourceFile = product.fields?.['Source File'];
    const workflowFileUrl = product.fields?.['Workflow JSON File URL'];

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

