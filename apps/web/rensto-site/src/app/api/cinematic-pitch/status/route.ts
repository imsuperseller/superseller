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

        // Poll Veo3.1 API directly for video status
        const kieApiKey = process.env.KIE_AI_API_KEY || 'cb711f74a221be35a20df8e26e722e04';
        
        const response = await fetch(
            `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${kieApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            // Handle 400 status (1080P still processing)
            if (response.status === 400) {
                return NextResponse.json({
                    state: 'generating',
                    videoUrl: null,
                    message: '1080P is processing. It should be ready in 1-2 minutes.',
                    taskId: taskId,
                    successFlag: 0
                });
            }
            throw new Error(`Veo3.1 API failed with status ${response.status}`);
        }

        const data = await response.json();

        // Veo3.1 response structure: successFlag (0=generating, 1=success, 2/3=failed)
        let videoUrl = null;
        let state = 'generating';
        
        if (data.data?.successFlag === 1 && data.data?.response?.resultUrls) {
            videoUrl = data.data.response.resultUrls[0] || null;
            state = 'success';
        } else if (data.data?.successFlag === 2 || data.data?.successFlag === 3) {
            state = 'fail';
        }

        return NextResponse.json({
            state: state,
            videoUrl: videoUrl,
            message: state === 'success' 
                ? 'Video ready' 
                : (state === 'fail' 
                    ? data.data?.errorMessage || 'Video generation failed' 
                    : 'Processing...'),
            taskId: taskId,
            successFlag: data.data?.successFlag || 0
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

