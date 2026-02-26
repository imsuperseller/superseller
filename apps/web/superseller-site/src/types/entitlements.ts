/**
 * User Entitlements System
 * Defines what features/tabs each user has access to in the dashboard
 */

export type ServiceType = 'lead-machine' | 'autonomous-secretary' | 'knowledge-engine' | 'content-engine';

// Customer-facing names (outcome-focused, not jargon)
export const SERVICE_DISPLAY_NAMES: Record<ServiceType, string> = {
    'lead-machine': 'The Lead Machine',
    'autonomous-secretary': 'Autonomous Secretary',
    'knowledge-engine': 'Knowledge Engine',
    'content-engine': 'The Content Engine',
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
    'lead-machine': 'Find qualified prospects in your niche automatically',
    'autonomous-secretary': 'Handles your Voice, WhatsApp, and Calendar 24/7',
    'knowledge-engine': 'Private intelligence system with your data',
    'content-engine': 'Blog posts & social content on autopilot',
};

export interface CustomSolutionEntitlement {
    projectId: string;
    status: 'discovery' | 'build' | 'review' | 'launch' | 'maintenance';
    packageName: string;
}

export interface InfrastructureHealth {
    provider: 'gologin' | 'telnyx' | 'racknerd' | 'n8n_cloud' | 'cloudflare' | 'docker';
    status: 'online' | 'offline' | 'warning';
    lastHeartbeat?: string;
    label?: string; // e.g. "Main FB Profile" or "Voice API"
    metrics?: {
        label: string;
        value: string;
    }[];
}

export interface SolutionInstance {
    id: string; // instance ID
    solutionId: string; // Template ID
    name: string;
    status: 'pending_setup' | 'configuring' | 'provisioning' | 'active' | 'suspended' | 'cancelled';
    type: 'Builder' | 'Bundle';
    activatedAt?: string;
    infrastructure?: InfrastructureHealth[];
}

export interface PartnerPayoutConfig {
    enabled: boolean;
    percentage: number; // e.g. 50
    payoutModel: 'profit_split' | 'fixed_per_lead' | 'revenue_share';
    bankDetails?: string; // Encrypted or masked
}

export interface UserEntitlements {
    // Free trial access
    freeLeadsTrial: boolean;
    freeLeadsRemaining?: number; // defaults to 10

    // Purchased pillars (Legacy monthly subscriptions)
    pillars: ServiceType[];

    // Active Engines (The new Solutions model)
    engines: SolutionInstance[];

    // Marketplace products (Legacy one-time purchases)
    marketplaceProducts: string[]; // product/template IDs

    // Partner Payout Config (V3.1)
    partnerPayout?: PartnerPayoutConfig;

    // Custom solution project (Legacy)
    customSolution: CustomSolutionEntitlement | null;
}

export interface UserProfile {
    email: string;
    name?: string;
    businessName?: string;
    createdAt: string;
    dashboardToken: string; // UUID for magic-link access
    entitlements: UserEntitlements;
}

// Tab visibility based on entitlements
export interface DashboardTabConfig {
    id: string;
    label: string;
    icon: string; // lucide icon name
    visible: boolean;
    locked?: boolean; // show but greyed out with upsell
    upsellMessage?: string;
}

export function getVisibleTabs(entitlements: UserEntitlements): DashboardTabConfig[] {
    const tabs: DashboardTabConfig[] = [
        {
            id: 'overview',
            label: 'Overview',
            icon: 'LayoutDashboard',
            visible: true, // always visible
        },
    ];

    // Lead Machine tab
    const hasLeads = entitlements.pillars.includes('lead-machine');
    tabs.push({
        id: 'leads',
        label: 'Leads',
        icon: 'Users',
        visible: hasLeads || entitlements.freeLeadsTrial,
        locked: !hasLeads && !entitlements.freeLeadsTrial,
        upsellMessage: hasLeads ? undefined : 'Activate The Lead Machine to unlock this tab',
    });

    // Secretary (Voice/WhatsApp) tab
    const hasSecretary = entitlements.pillars.includes('autonomous-secretary');
    tabs.push({
        id: 'voice',
        label: 'Secretary',
        icon: 'Bot',
        visible: hasSecretary || entitlements.pillars.length > 0,
        locked: !hasSecretary,
        upsellMessage: hasSecretary ? undefined : 'Add Autonomous Secretary for voice & message automation',
    });

    // Content tab
    const hasContent = entitlements.pillars.includes('content-engine');
    tabs.push({
        id: 'content',
        label: 'Content',
        icon: 'FileText',
        visible: hasContent || entitlements.pillars.length > 0,
        locked: !hasContent,
        upsellMessage: hasContent ? undefined : 'Add Content pillar for blog & social automation',
    });

    // Knowledge & Assets tab
    const hasKnowledge = entitlements.pillars.includes('knowledge-engine');
    tabs.push({
        id: 'knowledge',
        label: 'Knowledge',
        icon: 'Brain',
        visible: hasKnowledge || entitlements.pillars.length > 0,
        locked: !hasKnowledge,
        upsellMessage: hasKnowledge ? undefined : 'Add Knowledge Engine to build your RAG brain',
    });

    // Agent Hub - visible if any pillar or custom solution
    tabs.push({
        id: 'agent',
        label: 'Agent Hub',
        icon: 'Bot',
        visible: entitlements.pillars.length > 0 || entitlements.customSolution !== null,
    });

    // Active Engines / Solutions - the new primary tab
    if (entitlements.engines && entitlements.engines.length > 0) {
        tabs.push({
            id: 'engines',
            label: 'My Engines',
            icon: 'Zap',
            visible: true,
        });
    }

    // Earnings / Profit Share tab (V3.1)
    if (entitlements.partnerPayout && entitlements.partnerPayout.enabled) {
        tabs.push({
            id: 'earnings',
            label: 'Earnings',
            icon: 'DollarSign',
            visible: true,
        });
    }

    // Invoices & Usage - always visible if paying customer
    const isPayingCustomer = (entitlements.pillars && entitlements.pillars.length > 0) ||
        (entitlements.marketplaceProducts && entitlements.marketplaceProducts.length > 0) ||
        (entitlements.engines && entitlements.engines.length > 0) ||
        entitlements.customSolution !== null;
    if (isPayingCustomer) {
        tabs.push({
            id: 'invoices',
            label: 'Invoices',
            icon: 'CreditCard',
            visible: true,
        });
        tabs.push({
            id: 'usage',
            label: 'Usage',
            icon: 'TrendingUp',
            visible: true,
        });
    }

    return tabs;
}

// Default entitlements for new free trial user
export function getDefaultFreeTrialEntitlements(): UserEntitlements {
    return {
        freeLeadsTrial: true,
        freeLeadsRemaining: 10,
        pillars: [],
        engines: [],
        marketplaceProducts: [],
        customSolution: null,
    };
}
