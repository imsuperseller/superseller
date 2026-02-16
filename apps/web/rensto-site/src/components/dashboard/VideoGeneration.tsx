"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, CheckCircle2, Circle, Clock, Loader2, Video, AlertCircle, Plus, RefreshCw, Download, Copy, Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
export interface Clip {
    id: string;
    clip_number: number;
    status: "pending" | "generating" | "completed" | "done" | "failed";
    video_url?: string;
    prompt?: string;
    error_message?: string;
    to_room?: string;
}

export interface VideoJob {
    id: string;
    status: string;
    progress_percent: number;
    current_step: string;
    error_message?: string;
    finalUrl?: string;
    master_video_url?: string;
    vertical_video_url?: string;
    square_video_url?: string;
    portrait_video_url?: string;
    thumbnail_url?: string;
    listing: {
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    clips: Clip[];
}

// --- Sub-components ---

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        analyzing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        generating_prompts: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        generating_clips: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        stitching: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        exporting: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        completed: "bg-green-500/10 text-green-400 border-green-500/20",
        complete: "bg-green-500/10 text-green-400 border-green-500/20",
        failed: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const labels: Record<string, string> = {
        pending: "Queued",
        analyzing: "Analyzing",
        generating_prompts: "Scripting",
        generating_clips: "Generating",
        stitching: "Assembling",
        exporting: "Exporting",
        completed: "Ready",
        complete: "Ready",
        failed: "Failed",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", colors[status] || colors.pending)}>
            {labels[status] || status}
        </span>
    );
}

function ProgressBar({ step, progress, isFailed }: { step: string; progress: number; isFailed?: boolean }) {
    const steps = [
        { id: "analyzing", label: "Analysis" },
        { id: "generating_prompts", label: "Scripting" },
        { id: "generating_clips", label: "Production" },
        { id: "stitching", label: "Assembly" },
        { id: "completed", label: "Ready" },
    ];
    const currentIdx = Math.max(steps.findIndex((s) => s.id === step), 0);

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
                {steps.map((s, idx) => (
                    <div key={s.id} className={cn("flex flex-col items-center gap-2", idx <= currentIdx ? "text-white" : "text-gray-600")}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                            isFailed && idx === currentIdx ? "bg-red-500/20 border-red-500 text-red-500" :
                                idx < currentIdx ? "bg-green-500/20 border-green-500 text-green-500" :
                                    idx === currentIdx ? "bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                                        "bg-gray-800 border-gray-700"
                        )}>
                            {idx < currentIdx ? <CheckCircle2 size={16} /> :
                                idx === currentIdx && isFailed ? <AlertCircle size={16} /> :
                                    idx === currentIdx ? <Loader2 className="animate-spin" size={16} /> : <Circle size={16} />}
                        </div>
                        <span className="text-xs font-medium tracking-wide">{s.label}</span>
                    </div>
                ))}
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(progress, 5)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
            </div>
        </div>
    );
}

function DownloadButtons({ job }: { job: VideoJob }) {
    const masterUrl = job.finalUrl || job.master_video_url;
    const formats = [
        { label: "Horizontal (16:9)", url: masterUrl, desc: "MLS, YouTube, Website" },
        { label: "Vertical (9:16)", url: job.vertical_video_url, desc: "TikTok, Reels, Shorts" },
        { label: "Square (1:1)", url: job.square_video_url, desc: "Instagram Feed" },
        { label: "Portrait (4:5)", url: job.portrait_video_url, desc: "Instagram Post" },
    ].filter((f) => f.url);

    if (formats.length === 0) return null;

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-medium flex items-center gap-2 mb-4">
                <Download size={18} className="text-green-400" />
                Download Your Video
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formats.map((f) => (
                    <a
                        key={f.label}
                        href={f.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-colors group"
                    >
                        <div>
                            <p className="text-sm font-medium">{f.label}</p>
                            <p className="text-xs text-gray-500">{f.desc}</p>
                        </div>
                        <Download size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                ))}
            </div>
        </div>
    );
}

// --- Main Component ---

export default function VideoGenerationDashboard({ jobId }: { jobId?: string }) {
    const [job, setJob] = useState<VideoJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);
    const [regenClips, setRegenClips] = useState<Set<number>>(new Set());
    const [regenLoading, setRegenLoading] = useState(false);
    const [regenError, setRegenError] = useState<string | null>(null);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [startTime] = useState(Date.now());

    const fetchJob = useCallback(async () => {
        if (!jobId) return;
        try {
            const res = await fetch(`/api/video/jobs/${jobId}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data?.error || `Failed to fetch job (${res.status})`;
                throw new Error(msg);
            }
            const clips = (data.clips || []).map((c: any) => ({
                ...c,
                video_url: c.video_url ?? c.resultUrl,
                status: c.status === "done" ? "completed" : c.status,
            }));
            if (data.job && data.listing) {
                setJob({
                    ...data.job,
                    current_step: data.job.current_step ?? data.job.currentStep,
                    listing: data.listing,
                    clips,
                });
            } else {
                setJob({ ...data, clips });
            }
            if (data._fallback) setFallbackMode(true);
            if (data.clips?.length > 0) {
                setActiveClipId((prev) => {
                    if (prev) return prev;
                    const done = data.clips.find((c: any) => (c.status === "completed" || c.status === "done") && c.video_url);
                    return done?.id ?? data.clips[0].id;
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (!jobId) return;
        fetchJob();
        const interval = setInterval(fetchJob, 3000);
        return () => clearInterval(interval);
    }, [jobId, fetchJob]);

    useEffect(() => {
        if (!job) return;
        if (job.status === "completed" || job.status === "complete") {
            const url = job.finalUrl || job.master_video_url;
            if (url) setActiveClipId("full");
        }
    }, [job?.id, job?.status]);

    if (!jobId) return <div className="p-10 text-center text-gray-500">No Job ID provided.</div>;
    if (loading && !job) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-gray-500" size={32} /></div>;
    if (error) return (
        <div className="max-w-md mx-auto p-10 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={32} />
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/video" className="text-sm text-gray-400 hover:text-white">← Back to My Videos</Link>
        </div>
    );
    if (!job) return null;

    const clips = job.clips || [];
    const viewingFull = activeClipId === "full";
    const activeClip = viewingFull ? null : (clips.find(c => c.id === activeClipId) || clips[0] || null);
    const listing = job.listing || { address: "Loading...", city: "", state: "", zip: "" };
    const isComplete = job.status === "completed" || job.status === "complete";
    const masterUrl = job.finalUrl || job.master_video_url;

    // Dynamic time estimate
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const progress = job.progress_percent || 0;
    const estTotal = progress > 5 ? Math.floor(elapsed / (progress / 100)) : 600;
    const estRemaining = Math.max(0, estTotal - elapsed);
    const estMin = Math.floor(estRemaining / 60);
    const estSec = estRemaining % 60;

    const handleRegenerate = async () => {
        if (regenClips.size === 0 || !jobId) return;
        setRegenLoading(true);
        setRegenError(null);
        try {
            const res = await fetch(`/api/video/jobs/${jobId}/regenerate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clipNumbers: Array.from(regenClips) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || `Regenerate failed: ${res.status}`);
            setRegenClips(new Set());
            await fetchJob();
        } catch (err: any) {
            setRegenError(err.message);
        } finally {
            setRegenLoading(false);
        }
    };

    const toggleRegenClip = (n: number) => {
        setRegenClips((prev) => {
            const next = new Set(prev);
            if (next.has(n)) next.delete(n); else next.add(n);
            return next;
        });
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/video/${jobId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {fallbackMode && (
                <div className="bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-xl text-center text-sm text-amber-200">
                    Video service temporarily unavailable — showing cached data.
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link href="/video" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-2 transition-colors">
                        <ArrowLeft size={14} /> My Videos
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{listing.address || "Loading..."}</h1>
                    <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
                        <span>{listing.city}{listing.state ? `, ${listing.state}` : ""}</span>
                        {!isComplete && progress > 5 && (
                            <>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <Clock size={14} />
                                <span>~{estMin}:{estSec.toString().padStart(2, "0")} remaining</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isComplete && (
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? "Copied!" : "Share"}
                        </button>
                    )}
                    <StatusBadge status={job.status || "pending"} />
                </div>
            </div>

            {/* Error banner */}
            {job.status === "failed" && job.error_message && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm">{job.error_message}</span>
                </div>
            )}

            {/* Progress Bar */}
            {!isComplete && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <ProgressBar step={job.current_step || "analyzing"} progress={progress} isFailed={job.status === "failed"} />
                    <p className="mt-3 text-xs text-gray-500 text-center">
                        You can leave this page — your video will keep generating. Check back in a few minutes.
                    </p>
                </div>
            )}

            {/* Download buttons (when complete) */}
            {isComplete && <DownloadButtons job={job} />}

            {/* Split View: Video + Clips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: "500px" }}>
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className="h-full bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden relative aspect-video lg:aspect-auto">
                        {viewingFull && isComplete && masterUrl ? (
                            <video src={masterUrl} className="w-full h-full object-contain bg-black" controls autoPlay />
                        ) : activeClip?.video_url ? (
                            <video src={activeClip.video_url} className="w-full h-full object-contain bg-black" controls autoPlay loop />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                {activeClip?.status === "generating" ? (
                                    <>
                                        <Loader2 className="animate-spin text-blue-500" size={48} />
                                        <p className="mt-4 text-white/80 font-medium">Generating Scene {activeClip.clip_number}...</p>
                                        <p className="text-sm mt-1 text-gray-400 max-w-md text-center px-4">
                                            {activeClip.to_room?.replace(/_/g, " ") || "Processing..."}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Play className="text-gray-600" size={48} />
                                        <p className="mt-4">Waiting for clip...</p>
                                    </>
                                )}
                            </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-white/80">
                            {viewingFull ? "FULL VIDEO" : `SCENE ${activeClip?.clip_number || "0"} · ${(activeClip?.to_room || "").replace(/_/g, " ")}`}
                        </div>
                    </div>
                </div>

                {/* Clip Queue */}
                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-medium flex items-center gap-2 text-sm">
                            <Video size={14} className="text-gray-400" />
                            Scenes
                            <span className="ml-auto text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{clips.length}</span>
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                        {isComplete && masterUrl && (
                            <div
                                onClick={() => setActiveClipId("full")}
                                className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer",
                                    viewingFull
                                        ? "bg-blue-500/10 border-blue-500/50"
                                        : "bg-gray-800/20 border-gray-800 hover:bg-gray-800/50"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", viewingFull ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400")}>
                                        Full Video
                                    </span>
                                    <CheckCircle2 size={14} className="text-green-500" />
                                </div>
                            </div>
                        )}
                        {clips.map((clip) => {
                            const isDone = clip.status === "completed" || clip.status === "done";
                            return (
                                <div
                                    key={clip.id}
                                    onClick={() => setActiveClipId(clip.id)}
                                    className={cn(
                                        "p-3 rounded-xl border transition-all cursor-pointer",
                                        activeClipId === clip.id
                                            ? "bg-blue-500/10 border-blue-500/50"
                                            : "bg-gray-800/20 border-gray-800 hover:bg-gray-800/50"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-gray-300">
                                            Scene {clip.clip_number}{clip.to_room ? ` · ${clip.to_room.replace(/_/g, " ")}` : ""}
                                        </span>
                                        {isDone && <CheckCircle2 size={12} className="text-green-500" />}
                                        {clip.status === "generating" && <Loader2 size={12} className="animate-spin text-blue-500" />}
                                        {clip.status === "failed" && <AlertCircle size={12} className="text-red-500" />}
                                    </div>
                                    {isDone && clip.video_url && (
                                        <div className="h-0.5 w-full bg-green-500/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Regenerate section */}
            {isComplete && clips.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                        <RefreshCw size={18} className="text-blue-400" />
                        Fix Bad Scenes
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Select only the scenes that need fixing. Good scenes are kept and re-stitched. 10 credits per scene.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {clips.map((clip) => (
                            <label
                                key={clip.id}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm",
                                    regenClips.has(clip.clip_number)
                                        ? "bg-blue-500/20 border-blue-500/50 text-white"
                                        : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={regenClips.has(clip.clip_number)}
                                    onChange={() => toggleRegenClip(clip.clip_number)}
                                    className="rounded border-gray-600"
                                />
                                {clip.clip_number}{clip.to_room ? `: ${clip.to_room.replace(/_/g, " ")}` : ""}
                            </label>
                        ))}
                    </div>
                    {regenError && <p className="text-red-400 text-sm mb-3">{regenError}</p>}
                    <button
                        onClick={handleRegenerate}
                        disabled={regenClips.size === 0 || regenLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm"
                    >
                        {regenLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Regenerate {regenClips.size > 0 ? `(${regenClips.size} scene${regenClips.size > 1 ? "s" : ""} · ${regenClips.size * 10} credits)` : "selected"}
                    </button>
                </div>
            )}
        </div>
    );
}
