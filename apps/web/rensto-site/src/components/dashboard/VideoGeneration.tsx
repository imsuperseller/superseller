
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, CheckCircle2, Circle, Clock, Loader2, Video, Settings, LayoutDashboard, Home, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
export interface Clip {
    id: string;
    clip_number: number;
    status: "pending" | "generating" | "completed" | "failed";
    video_url?: string;
    prompt?: string;
    error_message?: string;
}

export interface VideoJob {
    id: string;
    status: "pending" | "analyzing" | "generating_prompts" | "generating_clips" | "stitching" | "completed" | "failed";
    progress_percent: number;
    current_step: string;
    error_message?: string;
    listing: {
        address: string;
        city: string;
        state: string;
        zip: string;
        exterior_photo_url?: string;
    };
    clips: Clip[];
}

// --- Components ---

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        generating_prompts: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        generating_clips: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        stitching: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        completed: "bg-green-500/10 text-green-500 border-green-500/20",
        failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", colors[status] || colors.pending)}>
            {status.replace("_", " ")}
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

    const currentIdx = steps.findIndex((s) => s.id === step) !== -1 ? steps.findIndex((s) => s.id === step) : 0;

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
                            {idx < currentIdx ? <CheckCircle2 size={16} /> : idx === currentIdx && isFailed ? <AlertCircle size={16} /> : idx === currentIdx ? <Loader2 className="animate-spin" size={16} /> : <Circle size={16} />}
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
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full box-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                />
            </div>
        </div>
    );
}

export default function VideoGenerationDashboard({ jobId }: { jobId?: string }) {
    const [job, setJob] = useState<VideoJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);

    // Poll for job updates
    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/video/jobs/${jobId}`);
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg =
                        data?.error ||
                        data?.message ||
                        (data?.job?.error_message ? `Job failed: ${data.job.error_message}` : null) ||
                        `Failed to fetch job (${res.status})`;
                    throw new Error(msg);
                }

                // Normalize clips: worker returns resultUrl, component expects video_url
                const clips = (data.clips || []).map((c: any) => ({
                    ...c,
                    video_url: c.video_url ?? c.resultUrl,
                    status: c.status === "done" ? "completed" : c.status,
                }));

                // Flatten the response to match VideoJob interface
                if (data.job && data.listing) {
                    setJob({
                        ...data.job,
                        current_step: data.job.current_step ?? data.job.currentStep,
                        listing: data.listing,
                        clips
                    });
                } else {
                    setJob({ ...data, clips });
                }

                // Set active clip to first generating or completed if none selected
                if (!activeClipId && data.clips?.length > 0) {
                    const firstPlayable = data.clips.find((c: Clip) => (c.status === "completed" || c.status === "done") && c.video_url) || data.clips[0];
                    setActiveClipId(firstPlayable.id);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
        const interval = setInterval(fetchJob, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [jobId, activeClipId]);

    if (!jobId) return <div className="p-10 text-center text-gray-500">No Job ID provided.</div>;
    if (loading && !job) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    if (error) return <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle /> {error}</div>;
    if (!job) return null;

    const clips = job.clips || [];
    const activeClip = clips.find(c => c.id === activeClipId) || clips[0] || null;
    const listing = job.listing || { address: "Loading...", city: "", state: "", zip: "" };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            {/* Sidebar (Mock) */}
            <div className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-[#0a0a0a] p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-10 text-xl font-bold tracking-tight">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Video size={18} className="text-white" />
                    </div>
                    Rensto<span className="text-gray-500">Video</span>
                </div>
                <Link
                    href="/video/create"
                    className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-lg bg-[#fe3d51] hover:bg-[#ff4d61] text-white font-semibold transition-colors"
                >
                    <Plus size={18} /> Create new tour
                </Link>
                <nav className="space-y-2 text-sm font-medium text-gray-400">
                    <div className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer flex items-center gap-3 transition-colors"><LayoutDashboard size={18} /> Dashboard</div>
                    <div className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer flex items-center gap-3 transition-colors"><Home size={18} /> Listings</div>
                    <div className="p-3 bg-blue-600/10 text-blue-500 rounded-lg cursor-pointer flex items-center gap-3"><Video size={18} /> Videos</div>
                    <div className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer flex items-center gap-3 transition-colors"><Settings size={18} /> Settings</div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 p-8 max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.address || "Loading..."}</h1>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <span>{listing.city}{listing.state ? `, ${listing.state}` : ""}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                            <Clock size={14} /> <span>Est. remaining: 02:45</span>
                        </div>
                    </div>
                    <StatusBadge status={job.status || "pending"} />
                </div>

                {job.status === "failed" && job.error_message && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>{job.error_message}</span>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                    <ProgressBar step={job.current_step || "analyzing"} progress={job.progress_percent || 0} isFailed={job.status === "failed"} />
                    <div className="mt-4 flex justify-between text-xs text-gray-500 font-mono">
                        <span>JOB ID: {job.id?.slice(0, 8) || "LOADING"}</span>
                        <span>MODEL: KLING_3.0</span>
                    </div>
                </div>

                {/* Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">

                    {/* Left: Video Player / Preview */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-full bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden relative group">
                            {activeClip?.video_url ? (
                                <video
                                    src={activeClip.video_url}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    loop
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 backdrop-blur-sm">
                                    {activeClip?.status === 'generating' ? (
                                        <>
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                                <Loader2 className="animate-spin text-blue-500 relative z-10" size={48} />
                                            </div>
                                            <p className="mt-6 text-lg font-medium text-white/80">Generating Clip {activeClip?.clip_number}...</p>
                                            <p className="text-sm mt-2 text-gray-400 max-w-md text-center px-4">&quot;{activeClip?.prompt?.slice(0, 100) || "Processing..."}...&quot;</p>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <Play className="ml-1 text-gray-600" size={24} />
                                            </div>
                                            <p>Clip Pending</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Overlay Info */}
                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-white/90">
                                CLIP {activeClip?.clip_number || "0"} • {activeClip?.status?.toUpperCase() || "WAITING"}
                            </div>
                        </div>
                    </div>

                    {/* Right: Clip Queue */}
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                            <h3 className="font-medium flex items-center gap-2">
                                <Video size={16} className="text-gray-400" />
                                Clip Queue
                                <span className="ml-auto text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{clips.length} Scenes</span>
                            </h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
                            {clips.map((clip) => (
                                <div
                                    key={clip.id}
                                    onClick={() => setActiveClipId(clip.id)}
                                    className={cn(
                                        "p-3 rounded-xl border transition-all cursor-pointer group",
                                        activeClipId === clip.id
                                            ? "bg-blue-500/10 border-blue-500/50 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]"
                                            : "bg-gray-800/20 border-gray-800 hover:bg-gray-800/50 hover:border-gray-700"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded",
                                            activeClipId === clip.id ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                                        )}>
                                            Scene {clip.clip_number}
                                        </span>
                                        {(clip.status === 'completed' || clip.status === 'done') && <CheckCircle2 size={14} className="text-green-500" />}
                                        {clip.status === 'generating' && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                        {clip.status === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
                                        {clip.prompt || "Awaiting prompt..."}
                                    </p>
                                    {clip.video_url && (
                                        <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

