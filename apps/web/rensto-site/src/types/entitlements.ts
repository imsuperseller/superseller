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
