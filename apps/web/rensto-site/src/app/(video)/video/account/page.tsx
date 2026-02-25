"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, CreditCard, History, User, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageEvent {
    id: string;
    type: string;
    amount: number;
    jobId?: string;
    metadata?: any;
    createdAt: string;
}

export default function AccountPage() {
    const [credits, setCredits] = useState<number | null>(null);
    const [usage, setUsage] = useState<UsageEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/video/credits").then((r) => r.json()),
            fetch("/api/video/usage").then((r) => r.json()).catch(() => ({ events: [] })),
        ])
            .then(([creditsData, usageData]) => {
                if (typeof creditsData.balance === "number") setCredits(creditsData.balance);
                if (Array.isArray(usageData.events)) setUsage(usageData.events);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link href="/video" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={14} /> Back to My Videos
            </Link>

            <h1 className="text-2xl font-bold mb-8">Account</h1>

            {/* Credits Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Coins size={18} className="text-amber-400" />
                        Credit Balance
                    </h2>
                    <Link
                        href="/video/pricing"
                        className="px-3 py-1.5 rounded-lg bg-[#fe3d51] text-white text-sm font-medium hover:bg-[#ff4d61] transition-colors"
                    >
                        Add Credits
                    </Link>
                </div>
                <div className="text-4xl font-bold text-amber-300">
                    {credits !== null ? credits : "—"}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                    1 video tour = 50 credits · Scene regeneration = 10 credits/scene
                </p>
            </div>

            {/* Subscription Management */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold flex items-center gap-2">
                            <CreditCard size={18} className="text-gray-400" />
                            Subscription
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage your plan, payment method, and invoices
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/billing/portal", { method: "POST" });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                                else alert("No active subscription found. Subscribe first at /video/pricing");
                            } catch {
                                alert("Could not open billing portal. Try again.");
                            }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors border border-white/10"
                    >
                        Manage Subscription <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Usage History */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <History size={18} className="text-gray-400" />
                    Usage History
                </h2>

                {usage.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No usage history yet.</p>
                ) : (
                    <div className="space-y-2">
                        {usage.slice(0, 50).map((event) => {
                            const isPositive = event.amount > 0;
                            const typeLabel: Record<string, string> = {
                                debit: "Used",
                                refund: "Refunded",
                                topup: "Purchased",
                                grant: "Granted",
                                reset: "Reset",
                            };
                            return (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {typeLabel[event.type] || event.type}
                                            {event.metadata?.deductType === "video_generation" && " — Video generation"}
                                            {event.metadata?.deductType === "clip_regeneration" && " — Scene fix"}
                                            {event.metadata?.reason && ` — ${event.metadata.reason}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(event.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                            {event.jobId && ` · Job ${event.jobId.slice(0, 8)}`}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-mono font-medium",
                                        isPositive ? "text-green-400" : "text-red-400"
                                    )}>
                                        {isPositive ? "+" : ""}{event.amount}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
