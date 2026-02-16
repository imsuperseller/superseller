"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Video, Plus, Loader2, Play, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobSummary {
    id: string;
    status: string;
    address?: string;
    city?: string;
    state?: string;
    finalUrl?: string;
    thumbnail_url?: string;
    progress?: number;
    progress_percent?: number;
    video_duration_seconds?: number;
    created_at?: string;
    clip_count?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Queued", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
    analyzing: { label: "Analyzing", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Loader2 },
    generating_prompts: { label: "Scripting", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Loader2 },
    generating_clips: { label: "Generating", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Loader2 },
    stitching: { label: "Assembling", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: Loader2 },
    exporting: { label: "Exporting", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: Loader2 },
    complete: { label: "Ready", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
    completed: { label: "Ready", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
    failed: { label: "Failed", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle },
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function VideoJobsPage() {
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/video/jobs")
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                    return;
                }
                setJobs(data.jobs || []);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Videos</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {jobs.length > 0 ? `${jobs.length} video${jobs.length !== 1 ? "s" : ""}` : "Create your first property tour"}
                    </p>
                </div>
                <Link
                    href="/video/create"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fe3d51] hover:bg-[#ff4d61] text-white font-medium transition-colors"
                >
                    <Plus size={18} /> New Video
                </Link>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/20 p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#fe3d51]/10 flex items-center justify-center mx-auto mb-6">
                        <Video className="w-8 h-8 text-[#fe3d51]" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Create your first AI property tour</h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                        Paste a Zillow URL, upload your headshot, and get a cinematic video tour in minutes. No editing required.
                    </p>
                    <Link
                        href="/video/create"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#fe3d51] hover:bg-[#ff4d61] text-white font-semibold transition-colors"
                    >
                        <Plus size={18} /> Create Your First Tour
                    </Link>
                    <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
                        <div>
                            <div className="text-2xl font-bold text-white">1</div>
                            <div className="text-xs text-gray-500 mt-1">Paste Zillow URL</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">2</div>
                            <div className="text-xs text-gray-500 mt-1">Add your headshot</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">3</div>
                            <div className="text-xs text-gray-500 mt-1">Get your video</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {!loading && jobs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job) => {
                        const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                        const StatusIcon = config.icon;
                        const isComplete = job.status === "complete" || job.status === "completed";
                        const isProcessing = !isComplete && job.status !== "failed";
                        const address = [job.address, job.city, job.state].filter(Boolean).join(", ") || "Untitled Property";
                        const progress = job.progress_percent ?? job.progress ?? 0;

                        return (
                            <Link
                                key={job.id}
                                href={`/video/${job.id}`}
                                className="group rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all overflow-hidden"
                            >
                                {/* Thumbnail / Preview */}
                                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                                    {job.thumbnail_url ? (
                                        <img
                                            src={job.thumbnail_url}
                                            alt={address}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                            <Video className="w-10 h-10 text-gray-700" />
                                        </div>
                                    )}
                                    {/* Play overlay for complete */}
                                    {isComplete && (
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <Play className="w-5 h-5 text-white ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                    {/* Processing overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="text-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
                                                <p className="text-xs text-white/80 mt-2">{progress}%</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Duration badge */}
                                    {isComplete && job.video_duration_seconds && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-mono text-white">
                                            {formatDuration(job.video_duration_seconds)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p className="font-medium text-sm truncate mb-2">{address}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", config.color)}>
                                            <StatusIcon size={12} className={isProcessing ? "animate-spin" : ""} />
                                            {config.label}
                                        </span>
                                        {job.created_at && (
                                            <span className="text-xs text-gray-500">{timeAgo(job.created_at)}</span>
                                        )}
                                    </div>
                                    {/* Progress bar for in-progress jobs */}
                                    {isProcessing && (
                                        <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(progress, 5)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
