"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import CompetitorAdCard from "./_components/CompetitorAdCard";

interface Ad {
  id: string;
  pageName?: string | null;
  adUrl?: string | null;
  adText?: string | null;
  adTitle?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaText?: string | null;
  startDate?: string | null;
  daysRunning?: number | null;
  longevityTier?: string | null;
  aiAnalysis?: {
    hookType?: string;
    angle?: string;
    emotionalTone?: string;
    visualStyle?: string;
    overallScore?: number;
  } | null;
  platforms?: unknown;
  liked?: boolean | null;
  feedbackNote?: string | null;
  feedbackBy?: string | null;
  feedbackAt?: string | null;
  createdAt?: string;
}

type FilterMode = "all" | "pending" | "liked" | "disliked";

export default function CompetePage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [reviewerName, setReviewerName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  const total = ads.length;
  const reviewed = ads.filter((a) => a.liked !== null).length;
  const likedCount = ads.filter((a) => a.liked === true).length;
  const dislikedCount = ads.filter((a) => a.liked === false).length;
  const pending = total - reviewed;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  useEffect(() => {
    if (!tenantSlug) return;
    fetch(`/api/compete/ads/${tenantSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setAds(data.ads || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  useEffect(() => {
    const saved = localStorage.getItem(`compete-reviewer-${tenantSlug}`);
    if (saved) { setReviewerName(saved); setNameSet(true); }
  }, [tenantSlug]);

  const handleSetName = () => {
    if (!reviewerName.trim()) return;
    localStorage.setItem(`compete-reviewer-${tenantSlug}`, reviewerName.trim());
    setNameSet(true);
  };

  const handleRate = useCallback(
    async (adId: string, liked: boolean, feedbackNote: string, feedbackBy: string) => {
      const res = await fetch(`/api/compete/ads/${tenantSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, liked, feedbackNote, feedbackBy }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || "Failed to save");
      }
      const { ad: updated } = await res.json();
      setAds((prev) =>
        prev.map((a) =>
          a.id === adId
            ? { ...a, liked: updated.liked, feedbackNote: updated.feedbackNote, feedbackBy: updated.feedbackBy, feedbackAt: updated.feedbackAt }
            : a
        )
      );
    },
    [tenantSlug]
  );

  const filteredAds = ads.filter((a) => {
    switch (filter) {
      case "pending": return a.liked === null;
      case "liked": return a.liked === true;
      case "disliked": return a.liked === false;
      default: return true;
    }
  });

  const displayName = tenantSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // ─── Name Entry (Hebrew) ───
  if (!nameSet) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0d1b2e 0%, #132038 50%, #162540 100%)" }}>
        <div className="relative max-w-md w-full">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 rounded-3xl opacity-30 blur-xl" style={{ background: "linear-gradient(135deg, #f47920, #4ecdc4, #2494e0)" }} />
          <div className="relative rounded-3xl border border-white/10 p-8 text-center" style={{ background: "rgba(22, 37, 64, 0.8)", backdropFilter: "blur(20px)" }}>
            {/* Logo area */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f47920, #4ecdc4)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">מחקר מתחרים</h1>
            <p className="text-sm mb-6" style={{ color: "#b0bec5" }}>
              דרגו את הפרסומות של המתחרים של{" "}
              <span className="font-bold" style={{ color: "#5ffbfd" }}>{displayName}</span>
              <br />
              המשוב שלכם מעצב ישירות את האסטרטגיה שלנו
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                placeholder="השם שלך (למשל: סער, מור, אלירן, נועם)"
                className="w-full rounded-xl px-4 py-3.5 text-center text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  focusRingColor: "#5ffbfd",
                }}
                autoFocus
              />
              <button
                onClick={handleSetName}
                disabled={!reviewerName.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: reviewerName.trim()
                    ? "linear-gradient(135deg, #f47920, #4ecdc4)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                בואו נתחיל
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: "#0d1b2e" }}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#5ffbfd", borderRightColor: "#f47920" }} />
          <p className="text-sm mt-4" style={{ color: "#94a3b8" }}>טוען פרסומות...</p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d1b2e" }}>
        <div className="rounded-2xl border border-red-500/20 p-8 max-w-md w-full text-center" style={{ background: "rgba(254, 61, 81, 0.05)" }}>
          <p className="text-red-400 font-medium mb-2">{error}</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            אם הטבלה עדיין לא קיימת, צריך קודם לגרד את הפרסומות
          </p>
        </div>
      </div>
    );
  }

  // ─── Empty ───
  if (total === 0) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d1b2e" }}>
        <div className="rounded-2xl border border-white/10 p-8 max-w-md w-full text-center" style={{ background: "rgba(22, 37, 64, 0.8)", backdropFilter: "blur(20px)" }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M3 3h18v18H3z" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">אין פרסומות עדיין</h2>
          <p style={{ color: "#94a3b8" }}>
            פרסומות המתחרים של {displayName} עדיין לא נאספו. הן יופיעו כאן ברגע שהמחקר יסתיים.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main Page ───
  const filterButtons: Array<{ key: FilterMode; label: string; count: number }> = [
    { key: "all", label: "הכל", count: total },
    { key: "pending", label: "ממתין", count: pending },
    { key: "liked", label: "אהבתי", count: likedCount },
    { key: "disliked", label: "לא אהבתי", count: dislikedCount },
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "linear-gradient(180deg, #0d1b2e 0%, #132038 100%)" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-white/5" style={{ background: "rgba(13, 27, 46, 0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">{displayName}</h1>
              <p className="text-xs" style={{ color: "#94a3b8" }}>מחקר פרסומות מתחרים</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>סוקר</p>
              <p className="text-sm font-bold" style={{ color: "#5ffbfd" }}>{reviewerName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs mb-2">
            <span style={{ color: "#b0bec5" }}>
              <span className="font-bold text-white">{total}</span> פרסומות
            </span>
            <span style={{ color: "#4ecdc4" }}>
              <span className="font-bold">{likedCount}</span> אהבתי
            </span>
            <span style={{ color: "#f47920" }}>
              <span className="font-bold">{dislikedCount}</span> לא אהבתי
            </span>
            <span style={{ color: "#94a3b8" }}>
              <span className="font-bold">{pending}</span> ממתין
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #f47920, #4ecdc4, #2494e0)",
                boxShadow: progress > 0 ? "0 0 12px rgba(95, 251, 253, 0.4)" : "none",
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {filterButtons.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: filter === key ? "linear-gradient(135deg, #f47920, #4ecdc4)" : "rgba(255,255,255,0.05)",
                  color: filter === key ? "white" : "#b0bec5",
                  border: filter === key ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Cards */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {filteredAds.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "#94a3b8" }}>אין פרסומות בפילטר הזה</p>
          </div>
        ) : (
          filteredAds.map((ad) => (
            <CompetitorAdCard
              key={ad.id}
              ad={ad}
              onRate={handleRate}
              reviewerName={reviewerName}
            />
          ))
        )}
      </div>

      {/* Completion */}
      {pending === 0 && total > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(135deg, #4ecdc4, #2494e0)" }} />
            <div className="relative border border-white/10 rounded-2xl p-8 text-center" style={{ backdropFilter: "blur(20px)" }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4ecdc4, #2494e0)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">סיימתם!</h3>
              <p className="text-sm" style={{ color: "#b0bec5" }}>
                סקרתם את כל {total} הפרסומות. המשוב שלכם כבר מעצב את אסטרטגיית התוכן.
                <br />אפשר לשנות דירוגים בכל עת.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
