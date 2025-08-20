import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Agent } from '@/models/Agent';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();
    const { id } = await params;

    if (action !== 'run') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "run"' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const agent = await Agent.findById(id);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Simulate triggering the n8n workflow
    // In a real implementation, this would:
    // 1. Call the n8n webhook endpoint
    // 2. Pass the Facebook groups data
    // 3. Trigger the Apify scraper
    // 4. Return the execution ID

    const executionId = `exec_${Date.now()}`;

    // Update agent with execution info
    await Agent.findByIdAndUpdate(id, {
      lastRun: new Date(),
      status: 'running',
      progress: 0,
    });

    // Simulate the n8n webhook call
    const n8nWebhookUrl =
      'http://173.254.201.134:5678/webhook/facebook-scraper';
    const webhookData = {
      executionId,
      agentId: id,
      action: 'run',
      groups: [
        'great kosher restaurants foodies',
        'Jewish Food x What Jew Wanna Eat',
        'ישראלים במיאמי / דרום פלורידה',
        // ... more groups
      ],
      apifyApiKey: 'apify_api_QfRR0XzZtbGi14p8xaTMc2Fg44a9aW0W5CQM',
    };

    // In production, this would be a real HTTP call
    console.log('🚀 Triggering n8n workflow:', n8nWebhookUrl);
    console.log('📊 Webhook data:', webhookData);

    return NextResponse.json({
      success: true,
      executionId,
      message: 'Facebook Group Scraper started successfully',
      estimatedTime: '2-3 minutes',
      webhookUrl: n8nWebhookUrl,
    });
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json({ error: 'Failed to run agent' }, { status: 500 });
  }
}
