import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const taskId = searchParams.get('taskId');

        if (!taskId) {
            return NextResponse.json(
                { error: 'taskId is required' },
                { status: 400 }
            );
        }

        // Poll Kie.ai API directly for video status
        const kieApiKey = process.env.KIE_AI_API_KEY || 'cb711f74a221be35a20df8e26e722e04';
        
        const response = await fetch(
            `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${kieApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Kie.ai API failed with status ${response.status}`);
        }

        const data = await response.json();

        // Extract video URL if ready
        let videoUrl = null;
        if (data.data?.state === 'success' && data.data?.resultJson) {
            try {
                const resultJson = JSON.parse(data.data.resultJson);
                videoUrl = resultJson.resultUrls?.[0] || null;
            } catch (e) {
                console.error('Failed to parse resultJson:', e);
            }
        }

        return NextResponse.json({
            state: data.data?.state || 'unknown',
            videoUrl: videoUrl,
            message: data.data?.state === 'success' 
                ? 'Video ready' 
                : (data.data?.state === 'fail' 
                    ? data.data?.failMsg || 'Video generation failed' 
                    : 'Processing...'),
            taskId: taskId
        });
    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to check video status', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

