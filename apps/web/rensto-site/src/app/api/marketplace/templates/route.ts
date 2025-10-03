import { NextRequest, NextResponse } from 'next/server';
import { AirtableApi } from '@/lib/airtable';

const airtable = new AirtableApi();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get templates from Airtable
    const templates = await airtable.getTemplates({
      category,
      search,
      sort,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      templates,
      pagination: {
        page,
        limit,
        total: templates.length,
        hasMore: templates.length === limit
      }
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    // Validate template data
    const validation = validateTemplateData(templateData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Create template in Airtable
    const template = await airtable.createTemplate(templateData);

    return NextResponse.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

function validateTemplateData(data: any) {
  const requiredFields = ['name', 'description', 'category', 'price'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  if (data.price < 0) {
    return {
      valid: false,
      error: 'Price must be positive'
    };
  }

  if (!['lead-generation', 'customer-management', 'marketing', 'sales'].includes(data.category)) {
    return {
      valid: false,
      error: 'Invalid category'
    };
  }

  return { valid: true };
}
