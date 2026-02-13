"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateVideoPage() {
    const router = useRouter();
    const [zillowUrl, setZillowUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/video/jobs/from-zillow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressOrUrl: zillowUrl }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.error || `Error ${res.status}`);
                setLoading(false);
                return;
            }

            const jobId = data.job?.id;
            if (!jobId) {
                setError("No job ID returned");
                setLoading(false);
                return;
            }

            router.push(`/video/${jobId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Request failed");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#110d28] text-white">
            <div className="container mx-auto max-w-2xl px-4 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-[#fe3d51]/10 border border-[#fe3d51]/20">
                        <Video className="w-6 h-6 text-[#fe3d51]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Create AI Property Tour</h1>
                        <p className="text-sm text-slate-400">Paste a Zillow URL to generate your video</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="zillowUrl" className="block text-sm font-medium text-slate-300 mb-2">
                            Zillow listing URL or address
                        </label>
                        <input
                            id="zillowUrl"
                            type="url"
                            placeholder="https://www.zillow.com/homedetails/..."
                            value={zillowUrl}
                            onChange={(e) => setZillowUrl(e.target.value)}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10",
                                "text-white placeholder:text-slate-500",
                                "focus:outline-none focus:ring-2 focus:ring-[#5ffbfd]/30 focus:border-[#5ffbfd]/50",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            disabled={loading}
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Example: https://www.zillow.com/homedetails/123-Main-St-Austin-TX-78701/123456_zpid/
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg",
                            "bg-[#fe3d51] hover:bg-[#ff4d61] text-white",
                            "disabled:opacity-70 disabled:cursor-not-allowed",
                            "transition-colors duration-200"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating job...
                            </>
                        ) : (
                            <>
                                <Home className="w-5 h-5" />
                                Generate Tour
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    You&apos;ll be redirected to watch your video generate. Generation typically takes 5–15 minutes.
                </p>
            </div>
        </div>
    );
}
