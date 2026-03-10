import { CREDIT_COSTS } from '@/data/pricing';

interface FeatureInfo {
    name: string;
    description: string;
    credits: number;
    unit: string;
}

const FEATURE_MAP: Record<string, FeatureInfo> = {
    tourReel: {
        name: 'VideoForge Video',
        description: 'AI-generated cinematic property tours from Zillow listings',
        credits: CREDIT_COSTS.forge.credits,
        unit: 'video',
    },
    fbBot: {
        name: 'Marketplace Bot',
        description: 'Automated Facebook Marketplace listings with AI copy & images',
        credits: CREDIT_COSTS.market.credits,
        unit: 'listing',
    },
    winnerStudio: {
        name: 'Winner Studio',
        description: 'AI avatar spokesperson videos for your brand',
        credits: CREDIT_COSTS.spoke.credits,
        unit: 'video',
    },
    frontDesk: {
        name: 'FrontDesk AI',
        description: 'AI phone receptionist that handles calls 24/7',
        credits: CREDIT_COSTS.frontdesk.credits,
        unit: 'call',
    },
    socialHub: {
        name: 'SocialHub',
        description: 'AI content creation and multi-platform publishing',
        credits: CREDIT_COSTS.buzz.credits,
        unit: 'post',
    },
    agentForge: {
        name: 'AgentForge',
        description: 'Multi-stage AI research and competitive intelligence',
        credits: CREDIT_COSTS.cortex.credits,
        unit: 'query',
    },
    leadPages: {
        name: 'Lead Pages',
        description: 'Branded landing pages with lead capture and notifications',
        credits: 0,
        unit: 'page',
    },
};

function getFeatureInfo(key: string): FeatureInfo {
    return FEATURE_MAP[key] || {
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        description: 'AI-powered automation',
        credits: 0,
        unit: 'action',
    };
}

export function PortalServices({ features }: { features: Record<string, boolean> }) {
    const activeFeatures = Object.entries(features).filter(([, enabled]) => enabled);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Active Services</h2>
            {activeFeatures.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-sm text-white/40">No services activated yet.</p>
                    <p className="text-xs text-white/30 mt-1">
                        Contact support to enable your crew members.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {activeFeatures.map(([feature]) => {
                        const info = getFeatureInfo(feature);
                        return (
                            <div
                                key={feature}
                                className="group flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 transition-all hover:bg-white/[0.06] hover:border-white/10"
                            >
                                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-400" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white">{info.name}</span>
                                        <span className="text-xs text-green-400">Active</span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-0.5">{info.description}</p>
                                    {info.credits > 0 && (
                                        <p className="text-[10px] text-[#4ecdc4]/60 mt-1">
                                            {info.credits} credits per {info.unit}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
