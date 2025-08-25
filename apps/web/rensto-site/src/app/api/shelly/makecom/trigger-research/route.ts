import { NextRequest, NextResponse } from 'next/server';

const MAKE_COM_API_KEY = '7cca707a-9429-4997-8ba9-fc67fc7e4b29';
const MAKE_COM_BASE_URL = 'https://us2.make.com/api/v2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, familyMemberIds, researchDepth } = body;

    // Validate input
    if (!clientId || !familyMemberIds) {
      return NextResponse.json(
        { error: 'Client ID and Family Member IDs are required' },
        { status: 400 }
      );
    }

    // Create Make.com scenario execution
    const scenarioResponse = await fetch(`${MAKE_COM_BASE_URL}/scenarios/executions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAKE_COM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scenarioId: 'shelly-family-research', // Will be configured in Make.com
        input: {
          client_id: clientId,
          family_member_ids: familyMemberIds,
          research_depth: researchDepth
        }
      })
    });

    if (!scenarioResponse.ok) {
      throw new Error('Failed to trigger Make.com scenario');
    }

    const result = await scenarioResponse.json();

    // Create profile record
    const profile = {
      id: result.executionId,
      clientId,
      familyName: `Family ${clientId}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      researchDepth
    };

    return NextResponse.json({
      success: true,
      profile,
      executionId: result.executionId
    });

  } catch (error) {
    console.error('Make.com API error:', error);
    return NextResponse.json(
      { error: 'Failed to process research request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      );
    }

    // Get execution status from Make.com
    const statusResponse = await fetch(`${MAKE_COM_BASE_URL}/scenarios/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${MAKE_COM_API_KEY}`
      }
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to get execution status');
    }

    const status = await statusResponse.json();

    return NextResponse.json({
      success: true,
      status: status.status,
      result: status.result
    });

  } catch (error) {
    console.error('Make.com status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check execution status' },
      { status: 500 }
    );
  }
}