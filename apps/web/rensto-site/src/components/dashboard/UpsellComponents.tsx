'use client';

import React from 'react';
import { ArrowRight, Sparkles, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { SERVICE_DISPLAY_NAMES, SERVICE_DESCRIPTIONS, ServiceType } from '@/types/entitlements';

interface UpsellCardProps {
    service: ServiceType;
    currentPrice?: number;
    bundlePrice?: number;
    onUpgrade: (service: ServiceType) => void;
    variant?: 'inline' | 'modal' | 'banner';
}

export function UpsellCard({
    service,
    currentPrice = 297,
    bundlePrice = 797,
    onUpgrade,
    variant = 'inline'
}: UpsellCardProps) {
    const displayName = SERVICE_DISPLAY_NAMES[service];
    const description = SERVICE_DESCRIPTIONS[service];

    if (variant === 'banner') {
        return (
            <div
                className="rounded-xl p-6 border relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 174, 247, 0.1) 0%, rgba(95, 251, 253, 0.1) 100%)',
                    borderColor: 'rgba(30, 174, 247, 0.3)'
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1eaef7]/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-[#1eaef7]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{displayName}</h3>
                            <p className="text-gray-400 text-sm">{description}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => onUpgrade(service)}
                        className="bg-[#1eaef7] hover:bg-[#1eaef7]/80 text-white font-bold"
                    >
                        Add for ${currentPrice}/mo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl p-6 border hover:border-[#5ffbfd]/50 transition-all cursor-pointer group"
            style={{ backgroundColor: 'var(--rensto-bg-card)', borderColor: 'rgba(255,255,255,0.1)' }}
            onClick={() => onUpgrade(service)}
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1eaef7] to-[#5ffbfd] flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-[#5ffbfd] transition-colors">
                        {displayName}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-[#5ffbfd] font-bold">${currentPrice}/mo</span>
                        <span className="text-gray-500 text-sm">or save with bundle</span>
                    </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#5ffbfd] transition-colors" />
            </div>
        </div>
    );
}

interface BundleUpsellProps {
    ownedServices: ServiceType[];
    bundlePrice?: number;
    onUpgrade: () => void;
}

export function BundleUpsell({
    ownedServices,
    bundlePrice = 797,
    onUpgrade
}: BundleUpsellProps) {
    const allServices: ServiceType[] = ['lead-machine', 'autonomous-secretary', 'knowledge-engine', 'content-engine'];
    const missingServices = allServices.filter(s => !ownedServices.includes(s));

    if (missingServices.length === 0) {
        // User has everything!
        return (
            <div
                className="rounded-xl p-6 text-center"
                style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(95, 251, 253, 0.1) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
            >
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold text-white mb-2">You have the Full Suite! 🎉</h3>
                <p className="text-gray-400">All automation services are active on your account.</p>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl p-6 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1a1438 0%, #110d28 100%)',
                border: '1px solid rgba(254, 61, 81, 0.3)'
            }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-[#fe3d51]" />
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">
                    Unlock the Full Suite & Save
                </h3>
                <p className="text-gray-400 mb-4">
                    Get all 4 services for one price. Maximum automation, minimum effort.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {allServices.map(service => (
                        <div
                            key={service}
                            className={`flex items-center gap-2 p-2 rounded-lg ${ownedServices.includes(service)
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-white/5 text-gray-400'
                                }`}
                        >
                            <Check className={`w-4 h-4 ${ownedServices.includes(service) ? 'text-green-500' : 'text-gray-600'}`} />
                            <span className="text-sm">{SERVICE_DISPLAY_NAMES[service]}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-3xl font-bold text-white">${bundlePrice}</span>
                        <span className="text-gray-400">/mo</span>
                        <span className="ml-2 text-sm text-green-400">(Save $391/mo)</span>
                    </div>
                    <Button
                        onClick={onUpgrade}
                        className="bg-gradient-to-r from-[#fe3d51] to-[#f7931e] hover:brightness-110 text-white font-bold px-6"
                    >
                        Get Full Suite
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
