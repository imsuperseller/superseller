import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { } from '@/lib/mongodb';

// Mock data source model - in production this would be a proper model
interface DataSource {
  id: string;
  type: string;
  name: string;
  credentials: {
    apiKey?: string;
    endpoint?: string;
    username?: string;
    isConfigured: boolean;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await request.json();
    const { id } = params;

    // Validate required fields
    if (!credentials.apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Encrypt the credentials before storing
    // 2. Store them in a secure database
    // 3. Test the connection before saving
    
    // For now, we'll simulate saving credentials
    const updatedDataSource: DataSource = {
      id,
      type: 'apify', // This would be determined by the data source
      name: 'Apify Web Scraping',
      credentials: {
        ...credentials,
        isConfigured: true,
      },
    };

    // Test the connection (optional)
    try {
      if (credentials.apiKey) {
        // Test API key validity
        const testResponse = await fetch('https://api.apify.com/v2/users/me', {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
          },
        });
        
        if (!testResponse.ok) {
          return NextResponse.json(
            { error: 'Invalid API key. Please check your credentials.' },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.warn('Could not test API connection:', error);
    }

    return NextResponse.json({ 
      success: true, 
      dataSource: updatedDataSource,
      message: 'Credentials saved successfully' 
    });
  } catch (error) {
    console.error('Error saving credentials:', error);
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    );
  }
}
