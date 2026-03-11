import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/agents
 * Returns ClaudeClaw agent configs, session status, and message stats.
 * Uses raw SQL since ClaudeClaw tables are not in Prisma schema (worker-managed via Drizzle/raw SQL).
 */
export async function GET() {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Query group_agent_config for configured agents
    let agentConfigs: any[] = [];
    try {
      agentConfigs = await prisma.$queryRaw`
        SELECT
          gac.id,
          gac.group_jid,
          gac.tenant_slug,
          gac.agent_name,
          gac.persona,
          gac.enabled,
          gac.created_at,
          gac.updated_at,
          t.name as tenant_name
        FROM group_agent_config gac
        LEFT JOIN "Tenant" t ON t.slug = gac.tenant_slug
        ORDER BY gac.updated_at DESC
      `;
    } catch {
      // Table may not exist yet — return empty
    }

    // Query recent group messages for activity stats (last 24h and 7d)
    let messageStats: any[] = [];
    try {
      messageStats = await prisma.$queryRaw`
        SELECT
          group_jid,
          COUNT(*) as total_messages,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as messages_24h,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as messages_7d,
          COUNT(*) FILTER (WHERE sender = 'agent') as agent_replies,
          MAX(created_at) as last_message_at
        FROM group_messages
        GROUP BY group_jid
      `;
    } catch {
      // Table may not exist
    }

    // Query tenant_memories for memory stats per tenant
    let memoryStats: any[] = [];
    try {
      memoryStats = await prisma.$queryRaw`
        SELECT
          tenant_slug,
          COUNT(*) as memory_count,
          MAX(created_at) as last_memory_at
        FROM tenant_memories
        GROUP BY tenant_slug
      `;
    } catch {}

    // Query tenant_profiles
    let profiles: any[] = [];
    try {
      profiles = await prisma.$queryRaw`
        SELECT tenant_slug, profile_data, updated_at
        FROM tenant_profiles
        ORDER BY updated_at DESC
      `;
    } catch {}

    // Build message stats map by group_jid
    const msgMap = new Map(
      messageStats.map((m: any) => [m.group_jid, {
        totalMessages: Number(m.total_messages),
        messages24h: Number(m.messages_24h),
        messages7d: Number(m.messages_7d),
        agentReplies: Number(m.agent_replies),
        lastMessageAt: m.last_message_at,
      }])
    );

    // Build memory stats map
    const memMap = new Map(
      memoryStats.map((m: any) => [m.tenant_slug, {
        memoryCount: Number(m.memory_count),
        lastMemoryAt: m.last_memory_at,
      }])
    );

    // Build profile map
    const profileMap = new Map(
      profiles.map((p: any) => [p.tenant_slug, {
        profileData: p.profile_data,
        updatedAt: p.updated_at,
      }])
    );

    // Assemble agent data
    const agents = agentConfigs.map((config: any) => {
      const stats = msgMap.get(config.group_jid) || {
        totalMessages: 0, messages24h: 0, messages7d: 0, agentReplies: 0, lastMessageAt: null,
      };
      const mem = memMap.get(config.tenant_slug) || { memoryCount: 0, lastMemoryAt: null };
      const profile = profileMap.get(config.tenant_slug);

      return {
        id: config.id,
        groupJid: config.group_jid,
        tenantSlug: config.tenant_slug,
        tenantName: config.tenant_name || config.tenant_slug,
        agentName: config.agent_name || 'ClaudeClaw Agent',
        persona: config.persona,
        enabled: config.enabled,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
        stats,
        memory: mem,
        hasProfile: !!profile,
        profileUpdatedAt: profile?.updatedAt || null,
        status: config.enabled
          ? (stats.messages24h > 0 ? 'active' : 'idle')
          : 'disabled',
      };
    });

    // Also get overall stats
    let overallStats = { totalAgents: agents.length, activeAgents: 0, totalMessages: 0, totalMemories: 0 };
    overallStats.activeAgents = agents.filter(a => a.status === 'active').length;
    overallStats.totalMessages = agents.reduce((sum, a) => sum + a.stats.totalMessages, 0);
    overallStats.totalMemories = memoryStats.reduce((sum: number, m: any) => sum + Number(m.memory_count), 0);

    return NextResponse.json({
      agents,
      overall: overallStats,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[agents] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch agent data', detail: error.message }, { status: 500 });
  }
}
