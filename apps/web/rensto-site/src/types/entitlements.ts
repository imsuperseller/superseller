/**
 * User Entitlements System
 * Defines what features/tabs each user has access to in the dashboard
 */

export type ServiceType = 'leads' | 'outreach' | 'voice' | 'content';

// Customer-facing names (outcome-focused, not jargon)
export const SERVICE_DISPLAY_NAMES: Record<ServiceType, string> = {
    leads: 'Get More Leads',
    outreach: 'Automated Outreach',
    voice: 'AI Phone Agent',
    content: 'Content Engine',
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
    leads: 'Find qualified prospects in your niche automatically',
    outreach: 'Follow up via email & SMS without lifting a finger',
    voice: 'Never miss a call – AI answers 24/7',
    content: 'Blog posts & social content on autopilot',
};

export interface CustomSolutionEntitlement {
    projectId: string;
    status: 'discovery' | 'build' | 'review' | 'launch' | 'maintenance';
    packageName: string;
}

export interface UserEntitlements {
    // Free trial access
    freeLeadsTrial: boolean;
    freeLeadsRemaining?: number; // defaults to 10

    // Purchased pillars (monthly subscriptions)
    pillars: ServiceType[];

    // Marketplace products (one-time purchases)
    marketplaceProducts: string[]; // product/template IDs

    // Custom solution project
    customSolution: CustomSolutionEntitlement | null;
}

export interface UserProfile {
    email: string;
    name?: string;
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

    // Leads tab - visible if free trial or leads pillar
    const hasLeads = entitlements.freeLeadsTrial || entitlements.pillars.includes('leads');
    tabs.push({
        id: 'leads',
        label: 'Leads',
        icon: 'Users',
        visible: hasLeads,
        locked: !hasLeads,
        upsellMessage: hasLeads ? undefined : 'Get 10 free leads to unlock this tab',
    });

    // Outreach tab
    const hasOutreach = entitlements.pillars.includes('outreach');
    tabs.push({
        id: 'outreach',
        label: 'Outreach',
        icon: 'Send',
        visible: hasOutreach || entitlements.pillars.includes('leads'), // show locked if has leads
        locked: !hasOutreach,
        upsellMessage: hasOutreach ? undefined : 'Add Outreach pillar to automate follow-ups',
    });

    // Voice AI tab
    const hasVoice = entitlements.pillars.includes('voice');
    tabs.push({
        id: 'voice',
        label: 'Voice AI',
        icon: 'Phone',
        visible: hasVoice || entitlements.pillars.length > 0, // show locked if has any pillar
        locked: !hasVoice,
        upsellMessage: hasVoice ? undefined : 'Add Voice AI pillar for automated calls',
    });

    // Content tab
    const hasContent = entitlements.pillars.includes('content');
    tabs.push({
        id: 'content',
        label: 'Content',
        icon: 'FileText',
        visible: hasContent || entitlements.pillars.length > 0,
        locked: !hasContent,
        upsellMessage: hasContent ? undefined : 'Add Content pillar for blog & social automation',
    });

    // Agent Hub - visible if any pillar or custom solution
    tabs.push({
        id: 'agent',
        label: 'Agent Hub',
        icon: 'Bot',
        visible: entitlements.pillars.length > 0 || entitlements.customSolution !== null,
    });

    // Marketplace Products - visible if purchased anything
    if (entitlements.marketplaceProducts.length > 0) {
        tabs.push({
            id: 'products',
            label: 'My Products',
            icon: 'Package',
            visible: true,
        });
    }

    // Custom Solution Project - visible if has custom solution
    if (entitlements.customSolution) {
        tabs.push({
            id: 'project',
            label: 'Project',
            icon: 'Briefcase',
            visible: true,
        });
    }

    // Invoices & Usage - always visible if paying customer
    const isPayingCustomer = entitlements.pillars.length > 0 ||
        entitlements.marketplaceProducts.length > 0 ||
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
        marketplaceProducts: [],
        customSolution: null,
    };
}
