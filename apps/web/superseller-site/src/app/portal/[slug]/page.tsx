import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { PortalStatsCards, type StatCardConfig } from './_components/portal-stats-cards';
import { PortalLeadTable, type PortalLead } from './_components/portal-lead-table';
import { PortalServices } from './_components/portal-services';
import { PortalOnboarding } from './_components/portal-onboarding';
import { PortalSocialAccounts } from './_components/portal-social-accounts';

interface TenantDashboardData {
    tenant: {
        name: string;
        slug: string;
        features: Record<string, boolean>;
        planTier: string;
        planCredits: number;
    };
    user: {
        id: string;
        name: string;
        email: string;
        businessName: string | null;
        creditsUsed: number;
    } | null;
    stats: StatCardConfig[];
    recentLeads: PortalLead[];
    totalActions: number;
}

async function getTenantDashboard(slug: string): Promise<TenantDashboardData | null> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
    });

    if (!tenant || tenant.status !== 'active') return null;

    const settings = (tenant.settings as Record<string, any>) || {};
    const plan = (tenant.plan as Record<string, any>) || {};
    const features = settings.features || {};
    const planCredits = plan.credits || settings.plan?.credits || 500;

    // TenantUser is a raw join table — query it separately
    const ownerLink = await prisma.tenantUser.findFirst({
        where: { tenantId: tenant.id, role: 'owner' },
    });
    const owner = ownerLink
        ? await prisma.user.findUnique({ where: { id: ownerLink.userId } })
        : null;

    let statCards: StatCardConfig[] = [];
    let recentLeads: PortalLead[] = [];
    let totalActions = 0;
    let creditsUsed = 0;

    if (owner) {
        const [leadCount, videoCount, postCount, callCount, usageCount, leads] = await Promise.all([
            prisma.lead.count({ where: { userId: owner.id } }),
            prisma.usageLog.count({ where: { clientId: owner.id, agentId: { in: ['forge', 'spoke'] } } }),
            prisma.contentPost.count({ where: { userId: owner.id } }),
            prisma.voiceCallLog.count({ where: { userId: owner.id } }),
            prisma.usageLog.count({ where: { clientId: owner.id } }),
            prisma.lead.findMany({
                where: { userId: owner.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
            }),
        ]);

        totalActions = usageCount;
        const ownerMetrics = (owner.metrics as any) || {};
        creditsUsed = ownerMetrics.creditsUsed || 0;

        // Build stat cards based on active features
        statCards = [
            { label: 'Total Leads', value: leadCount, icon: 'users', color: 'cyan' },
        ];
        if (features.tourReel) {
            statCards.push({ label: 'Videos Created', value: videoCount, icon: 'video', color: 'purple' });
        }
        if (features.fbBot) {
            statCards.push({ label: 'Posts Published', value: postCount, icon: 'share', color: 'blue' });
        }
        if (features.frontDesk) {
            statCards.push({ label: 'Calls Handled', value: callCount, icon: 'phone', color: 'green' });
        }
        statCards.push({
            label: 'Credits',
            value: `${creditsUsed}/${planCredits}`,
            icon: 'zap',
            color: 'orange',
            progress: planCredits > 0 ? (creditsUsed / planCredits) * 100 : 0,
        });

        recentLeads = leads.map((l) => ({
            id: l.id,
            name: l.name || 'Unknown',
            email: l.email,
            phone: l.phone,
            status: l.status || 'new',
            createdAt: l.createdAt.toISOString(),
        }));
    } else {
        // No owner linked yet — show placeholder stats
        statCards = [
            { label: 'Total Leads', value: 0, icon: 'users', color: 'cyan' },
            { label: 'Credits', value: `0/${planCredits}`, icon: 'zap', color: 'orange', progress: 0 },
        ];
    }

    return {
        tenant: { name: tenant.name, slug: tenant.slug, features, planTier: plan.tier || 'starter', planCredits },
        user: owner ? { id: owner.id, name: owner.name || '', email: owner.email, businessName: owner.businessName, creditsUsed } : null,
        stats: statCards,
        recentLeads,
        totalActions,
    };
}

export default async function TenantDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getTenantDashboard(slug);

    if (!data) notFound();

    const { tenant, stats, recentLeads, totalActions } = data;

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back{data.user?.name ? `, ${data.user.name}` : ''}
                </h1>
                <p className="mt-1 text-white/60">
                    {data.user?.businessName || tenant.name} Dashboard
                    <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize text-white/40">
                        {tenant.planTier}
                    </span>
                </p>
            </div>

            {/* Onboarding Banner — shown only for new users */}
            <PortalOnboarding
                userName={data.user?.name || ''}
                planTier={tenant.planTier}
                planCredits={tenant.planCredits}
                creditsUsed={data.user?.creditsUsed || 0}
                features={tenant.features}
                totalActions={totalActions}
            />

            {/* Stats Grid */}
            <PortalStatsCards stats={stats} />

            {/* Feature Sections */}
            <div className="grid gap-6 lg:grid-cols-2">
                <PortalLeadTable leads={recentLeads} />
                <div className="space-y-6">
                    <PortalServices features={tenant.features} />
                    {data.user && <PortalSocialAccounts userId={data.user.id} />}
                </div>
            </div>
        </div>
    );
}
