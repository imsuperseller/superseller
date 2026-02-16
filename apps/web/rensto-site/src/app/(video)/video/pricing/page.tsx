"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Coins, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
    {
        name: "Starter",
        price: 49,
        period: "/mo",
        videos: 5,
        credits: 250,
        features: [
            "5 video tours per month",
            "All formats (16:9, 9:16, 1:1, 4:5)",
            "AI realtor placement",
            "Music overlay",
            "Scene regeneration",
        ],
        cta: "Start with Starter",
        popular: false,
    },
    {
        name: "Professional",
        price: 99,
        period: "/mo",
        videos: 15,
        credits: 750,
        features: [
            "15 video tours per month",
            "All formats (16:9, 9:16, 1:1, 4:5)",
            "AI realtor placement",
            "Music overlay",
            "Scene regeneration",
            "Priority processing",
            "Text overlays",
        ],
        cta: "Go Professional",
        popular: true,
    },
    {
        name: "Agency",
        price: 199,
        period: "/mo",
        videos: 50,
        credits: 2500,
        features: [
            "50 video tours per month",
            "All formats (16:9, 9:16, 1:1, 4:5)",
            "AI realtor placement",
            "Music overlay",
            "Scene regeneration",
            "Priority processing",
            "Text overlays",
            "Team access (coming soon)",
        ],
        cta: "Scale with Agency",
        popular: false,
    },
];

export default function PricingPage() {
    const [credits, setCredits] = useState<number | null>(null);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/video/credits")
            .then((r) => r.json())
            .then((d) => {
                if (typeof d.balance === "number") setCredits(d.balance);
            })
            .catch(() => {});
    }, []);

    const handleSubscribe = async (planName: string) => {
        setPurchasing(planName);
        // TODO: Integrate with Stripe checkout via /api/checkout
        // For now, show a placeholder
        alert(`Stripe checkout integration coming soon for ${planName} plan. Contact support for early access.`);
        setPurchasing(null);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Link href="/video" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={14} /> Back to My Videos
            </Link>

            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Create cinematic AI property tours from any Zillow listing. Each plan includes a monthly credit allocation.
                </p>
                {credits !== null && (
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                        <Coins size={14} />
                        Current balance: {credits} credits
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={cn(
                            "rounded-2xl border p-6 flex flex-col",
                            plan.popular
                                ? "border-[#fe3d51]/50 bg-[#fe3d51]/5 relative"
                                : "border-white/10 bg-white/[0.02]"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#fe3d51] text-white text-xs font-bold">
                                Most Popular
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-gray-400 text-sm">{plan.period}</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                {plan.videos} videos/month · {plan.credits} credits
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                                    <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.name)}
                            disabled={purchasing !== null}
                            className={cn(
                                "w-full py-3 rounded-xl font-medium transition-colors",
                                plan.popular
                                    ? "bg-[#fe3d51] hover:bg-[#ff4d61] text-white"
                                    : "bg-white/10 hover:bg-white/15 text-white border border-white/10",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {purchasing === plan.name ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                plan.cta
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
                <p>All plans include automatic credit refunds for failed generations.</p>
                <p className="mt-1">Need a custom plan? <a href="mailto:admin@rensto.com" className="text-[#fe3d51] hover:underline">Contact us</a></p>
            </div>
        </div>
    );
}
