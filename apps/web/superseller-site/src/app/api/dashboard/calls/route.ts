import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/calls?token=xxx&limit=50&offset=0
 * Returns voice call logs and secretary config for the dashboard VoiceTab.
 * Auth: dashboard token (same as entitlements API).
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!token) {
            return NextResponse.json({ error: 'Missing dashboard token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { dashboardToken: token },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
        }

        // Fetch call logs and config in parallel
        const [callLogs, config, totalCount] = await Promise.all([
            prisma.voiceCallLog.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    callerPhone: true,
                    callerName: true,
                    direction: true,
                    duration: true,
                    outcome: true,
                    summary: true,
                    sentiment: true,
                    leadCaptured: true,
                    creditsCharged: true,
                    startedAt: true,
                    endedAt: true,
                    createdAt: true,
                },
            }),
            prisma.secretaryConfig.findFirst({
                where: { clientId: user.id },
                select: {
                    agentName: true,
                    voiceId: true,
                    greeting: true,
                    tone: true,
                    phoneNumber: true,
                    transferNumber: true,
                    availability: true,
                    telnyxAssistantId: true,
                },
            }),
            prisma.voiceCallLog.count({ where: { userId: user.id } }),
        ]);

        // Map to the shape VoiceTab expects (CallLog interface)
        const formattedLogs = callLogs.map((log) => ({
            id: log.id,
            caller: log.callerName || 'Unknown Caller',
            callerPhone: log.callerPhone || '',
            duration: log.duration,
            outcome: log.outcome as 'answered' | 'voicemail' | 'missed' | 'transferred',
            timestamp: (log.startedAt || log.createdAt).toISOString(),
            summary: log.summary || undefined,
        }));

        // Map config to VoiceAgentConfig shape
        const formattedConfig = config
            ? {
                name: config.agentName || 'FrontDesk AI',
                voiceId: config.voiceId || 'default',
                greeting: config.greeting || '',
                availability: (config.availability as { enabled: boolean; hours: string }) || {
                    enabled: true,
                    hours: '24/7',
                },
                transferNumber: config.transferNumber || undefined,
                phoneNumber: config.phoneNumber || undefined,
                isProvisioned: !!config.telnyxAssistantId,
            }
            : null;

        // Stats
        const stats = {
            total: totalCount,
            answered: callLogs.filter((c) => c.outcome === 'answered').length,
            missed: callLogs.filter((c) => c.outcome === 'missed').length,
            avgDuration:
                callLogs.length > 0
                    ? Math.round(callLogs.reduce((acc, c) => acc + (c.duration ?? 0), 0) / callLogs.length)
                    : 0,
            totalCreditsUsed: callLogs.reduce((acc, c) => acc + (c.creditsCharged ?? 0), 0),
        };

        return NextResponse.json({
            success: true,
            callLogs: formattedLogs,
            config: formattedConfig,
            stats,
            pagination: { total: totalCount, limit, offset },
        });
    } catch (error) {
        console.error('[Dashboard Calls API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch call data' }, { status: 500 });
    }
}
