"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, Home } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function CreateVideoForm() {
    const router = useRouter();
    const [zillowUrl, setZillowUrl] = useState("");
    const [realtorFile, setRealtorFile] = useState<File | null>(null);
    const [floorplanFile, setFloorplanFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
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

    const inputStyle = cn(
        "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10",
        "text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium",
        "file:bg-[#fe3d51]/20 file:text-[#fe3d51] hover:file:bg-[#fe3d51]/30",
        "focus:outline-none focus:ring-2 focus:ring-[#5ffbfd]/30 focus:border-[#5ffbfd]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    return (
        <>
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
                        className={inputStyle}
                        disabled={loading}
                        required
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Example: https://www.zillow.com/homedetails/123-Main-St-Austin-TX-78701/123456_zpid/
                    </p>
                </div>

                <div>
                    <label htmlFor="realtorPhoto" className="block text-sm font-medium text-slate-300 mb-2">
                        Realtor headshot <span className="text-[#fe3d51]">*</span>
                    </label>
                    <input
                        id="realtorPhoto"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setRealtorFile(e.target.files?.[0] ?? null)}
                        className={inputStyle}
                        disabled={loading}
                        required
                    />
                    <p className="mt-2 text-xs text-slate-500">Used to place you in each scene. JPG, PNG, or WebP.</p>
                </div>

                <div>
                    <label htmlFor="floorplan" className="block text-sm font-medium text-slate-300 mb-2">
                        Floorplan <span className="text-slate-500 font-normal">(optional)</span>
                    </label>
                    <input
                        id="floorplan"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setFloorplanFile(e.target.files?.[0] ?? null)}
                        className={inputStyle}
                        disabled={loading}
                    />
                    <p className="mt-2 text-xs text-slate-500">AI can detect floorplan in listing photos if you skip.</p>
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
        </>
    );
}
