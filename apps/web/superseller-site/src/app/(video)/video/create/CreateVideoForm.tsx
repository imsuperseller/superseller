"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Home, Upload, Coins, AlertCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VIDEO_CREDIT_COST = parseInt(process.env.NEXT_PUBLIC_VIDEO_CREDIT_COST || "50", 10);

async function fileToBase64(file: File): Promise<{ base64: string; contentType: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            if (!base64) reject(new Error("Failed to read file"));
            else resolve({ base64, contentType: file.type || "image/png" });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function isZillowUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.hostname.includes("zillow.com");
    } catch {
        return false;
    }
}

export default function CreateVideoForm() {
    const router = useRouter();
    const [zillowUrl, setZillowUrl] = useState("");
    const [realtorFile, setRealtorFile] = useState<File | null>(null);
    const [realtorPreview, setRealtorPreview] = useState<string | null>(null);
    const [floorplanFile, setFloorplanFile] = useState<File | null>(null);
    const [floorplanPreview, setFloorplanPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);

    // Fetch credit balance
    useEffect(() => {
        fetch("/api/video/credits")
            .then((r) => r.json())
            .then((d) => {
                if (typeof d.balance === "number") setCredits(d.balance);
            })
            .catch(() => {});
    }, []);

    // Image preview handlers
    const handleRealtorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setRealtorFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setRealtorPreview(url);
        } else {
            setRealtorPreview(null);
        }
    };

    const handleFloorplanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFloorplanFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setFloorplanPreview(url);
        } else {
            setFloorplanPreview(null);
        }
    };

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");

            // Validate Zillow URL
            if (!isZillowUrl(zillowUrl)) {
                setError("Please enter a valid Zillow URL (e.g. https://www.zillow.com/homedetails/...)");
                return;
            }

            setLoading(true);
            try {
                let realtorBase64: string | undefined;
                let realtorContentType: string | undefined;
                if (realtorFile) {
                    const r = await fileToBase64(realtorFile);
                    realtorBase64 = r.base64;
                    realtorContentType = r.contentType;
                }

                let floorplanBase64: string | undefined;
                let floorplanContentType: string | undefined;
                if (floorplanFile) {
                    const f = await fileToBase64(floorplanFile);
                    floorplanBase64 = f.base64;
                    floorplanContentType = f.contentType;
                }

                const res = await fetch("/api/video/jobs/from-zillow", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        addressOrUrl: zillowUrl,
                        realtorBase64,
                        realtorContentType,
                        floorplanBase64,
                        floorplanContentType,
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (res.status === 402) {
                    setError(data.error || "Insufficient credits");
                    setLoading(false);
                    return;
                }
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
        },
        [zillowUrl, realtorFile, floorplanFile, router]
    );

    const hasEnoughCredits = credits === null || credits >= VIDEO_CREDIT_COST;

    const inputStyle = cn(
        "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10",
        "text-white placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-[#fe3d51]/30 focus:border-[#fe3d51]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const fileInputStyle = cn(
        inputStyle,
        "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium",
        "file:bg-[#fe3d51]/20 file:text-[#fe3d51] hover:file:bg-[#fe3d51]/30"
    );

    return (
        <div className="space-y-6">
            {/* Credit Balance Card */}
            <div className={cn(
                "rounded-xl border p-4 flex items-center justify-between",
                hasEnoughCredits
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-red-500/5 border-red-500/20"
            )}>
                <div className="flex items-center gap-3">
                    <Coins size={18} className={hasEnoughCredits ? "text-amber-400" : "text-red-400"} />
                    <div>
                        <p className="text-sm font-medium">
                            {credits !== null ? `${credits} credits available` : "Loading credits..."}
                        </p>
                        <p className="text-xs text-gray-500">
                            This video will cost {VIDEO_CREDIT_COST} credits
                        </p>
                    </div>
                </div>
                {!hasEnoughCredits && (
                    <Link
                        href="/video/pricing"
                        className="px-3 py-1.5 rounded-lg bg-[#fe3d51] text-white text-sm font-medium hover:bg-[#ff4d61] transition-colors"
                    >
                        Get Credits
                    </Link>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Zillow URL */}
                <div>
                    <label htmlFor="zillowUrl" className="block text-sm font-medium text-gray-300 mb-2">
                        Zillow listing URL
                    </label>
                    <input
                        id="zillowUrl"
                        type="url"
                        placeholder="https://www.zillow.com/homedetails/..."
                        value={zillowUrl}
                        onChange={(e) => setZillowUrl(e.target.value)}
                        className={inputStyle}
                        disabled={loading}
                        required
                    />
                    {zillowUrl && !isZillowUrl(zillowUrl) && (
                        <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                            <AlertCircle size={12} /> Must be a zillow.com URL
                        </p>
                    )}
                </div>

                {/* Realtor Headshot */}
                <div>
                    <label htmlFor="realtorPhoto" className="block text-sm font-medium text-gray-300 mb-2">
                        Your headshot <span className="text-[#fe3d51]">*</span>
                    </label>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <input
                                id="realtorPhoto"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleRealtorChange}
                                className={fileInputStyle}
                                disabled={loading}
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Professional headshot works best. You&apos;ll appear in every scene. JPG, PNG, or WebP.
                            </p>
                        </div>
                        {realtorPreview && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <img src={realtorPreview} alt="Headshot preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Floorplan */}
                <div>
                    <label htmlFor="floorplan" className="block text-sm font-medium text-gray-300 mb-2">
                        Floorplan <span className="text-gray-500 font-normal">(optional, improves tour flow)</span>
                    </label>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <input
                                id="floorplan"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFloorplanChange}
                                className={fileInputStyle}
                                disabled={loading}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                AI will detect floorplan from listing photos if you skip this.
                            </p>
                        </div>
                        {floorplanPreview && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <img src={floorplanPreview} alt="Floorplan preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                            <p>{error}</p>
                            {error.includes("Insufficient credits") && (
                                <Link href="/video/pricing" className="text-[#fe3d51] hover:underline mt-1 inline-block">
                                    Purchase more credits →
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !hasEnoughCredits}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg",
                        "bg-[#fe3d51] hover:bg-[#ff4d61] text-white",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        "transition-colors duration-200"
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating your tour...
                        </>
                    ) : (
                        <>
                            <Home className="w-5 h-5" />
                            Generate Tour ({VIDEO_CREDIT_COST} credits)
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500">
                Generation takes 5-15 minutes. You&apos;ll be redirected to watch progress. Credits are refunded if generation fails.
            </p>
        </div>
    );
}
