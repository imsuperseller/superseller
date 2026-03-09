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

  // ─── Name Entry ───
  if (!nameSet) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "var(--superseller-bg-primary)" }}>
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07] blur-3xl animate-pulse" style={{ background: "var(--superseller-orange)" }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05] blur-3xl animate-pulse" style={{ background: "var(--superseller-cyan)", animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-3xl" style={{ background: "var(--superseller-blue)" }} />
        </div>

        <div className="relative max-w-md w-full animate-[superseller-fadeIn_0.6s_ease-out]">
          {/* Glow ring behind card */}
          <div className="absolute -inset-px rounded-3xl opacity-40 blur-xl" style={{ background: "linear-gradient(135deg, var(--superseller-orange), var(--superseller-cyan), var(--superseller-blue))" }} />

          <div className="relative rounded-3xl border border-white/10 p-8 text-center ring-1 ring-inset ring-white/5" style={{ background: "rgba(22, 37, 64, 0.7)", backdropFilter: "blur(24px)" }}>
            {/* Logo icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--superseller-orange), var(--superseller-cyan))" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--superseller-text-primary)" }}>
              מחקר מתחרים
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--superseller-text-secondary)" }}>
              דרגו את הפרסומות של המתחרים של{" "}
              <span className="font-bold" style={{ color: "var(--superseller-text-accent)" }}>{displayName}</span>
              <br />
              <span className="text-xs" style={{ color: "var(--superseller-text-muted)" }}>המשוב שלכם מעצב ישירות את האסטרטגיה שלנו</span>
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                placeholder="השם שלך (למשל: סער, מור, אלירן, נועם)"
                className="superseller-input w-full text-center"
                autoFocus
              />
              <button
                onClick={handleSetName}
                disabled={!reviewerName.trim()}
                className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: reviewerName.trim()
                    ? "linear-gradient(135deg, var(--superseller-orange), var(--superseller-cyan))"
                    : "rgba(255,255,255,0.05)",
                  color: "var(--superseller-text-primary)",
                  boxShadow: reviewerName.trim() ? "0 8px 32px rgba(244, 121, 32, 0.25)" : "none",
                }}
              >
                בואו נתחיל
              </button>
            </div>

            {/* Subtle branding */}
            <p className="mt-6 text-[10px] tracking-widest uppercase" style={{ color: "var(--superseller-text-muted)", opacity: 0.5 }}>
              Powered by SuperSeller AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--superseller-bg-primary)" }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--superseller-cyan)", borderRightColor: "var(--superseller-orange)" }} />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent animate-spin" style={{ borderBottomColor: "var(--superseller-blue)", animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="text-sm mt-6 animate-pulse" style={{ color: "var(--superseller-text-muted)" }}>טוען פרסומות...</p>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--superseller-bg-primary)" }}>
        <div className="rounded-2xl border p-8 max-w-md w-full text-center" style={{ borderColor: "rgba(254, 61, 81, 0.2)", background: "rgba(254, 61, 81, 0.05)", backdropFilter: "blur(16px)" }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(254, 61, 81, 0.1)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fe3d51" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <p className="font-semibold mb-2" style={{ color: "#fe3d51" }}>{error}</p>
          <p className="text-xs" style={{ color: "var(--superseller-text-muted)" }}>
            אם הטבלה עדיין לא קיימת, צריך קודם לגרד את הפרסומות
          </p>
        </div>
      </div>
    );
  }

  // ─── Empty ───
  if (total === 0) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--superseller-bg-primary)" }}>
        <div className="superseller-card max-w-md w-full text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--superseller-text-muted)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--superseller-text-primary)" }}>אין פרסומות עדיין</h2>
          <p className="text-sm" style={{ color: "var(--superseller-text-secondary)" }}>
            פרסומות המתחרים של {displayName} עדיין לא נאספו. הן יופיעו כאן ברגע שהמחקר יסתיים.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main Page ───
  const filterButtons: Array<{ key: FilterMode; label: string; count: number; icon: string }> = [
    { key: "all", label: "הכל", count: total, icon: "M4 6h16M4 12h16M4 18h16" },
    { key: "pending", label: "ממתין", count: pending, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "liked", label: "אהבתי", count: likedCount, icon: "M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" },
    { key: "disliked", label: "לא אהבתי", count: dislikedCount, icon: "M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" },
  ];

  return (
    <div dir="rtl" className="min-h-screen relative" style={{ background: "linear-gradient(180deg, var(--superseller-bg-primary) 0%, var(--superseller-bg-surface) 100%)" }}>
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(95, 251, 253, 0.03) 0%, transparent 60%)" }} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06]" style={{ background: "rgba(13, 27, 46, 0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--superseller-text-primary)" }}>{displayName}</h1>
              <p className="text-[11px] tracking-wide uppercase mt-0.5" style={{ color: "var(--superseller-text-muted)", letterSpacing: "0.08em" }}>
                מחקר פרסומות מתחרים
              </p>
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-[0.15em] mb-0.5" style={{ color: "var(--superseller-text-muted)" }}>סוקר</p>
              <p className="text-sm font-bold" style={{ color: "var(--superseller-text-accent)" }}>{reviewerName}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 text-xs mb-3">
            <span style={{ color: "var(--superseller-text-secondary)" }}>
              <span className="font-bold text-white">{total}</span> פרסומות
            </span>
            <span>
              <span className="font-bold" style={{ color: "var(--superseller-cyan)" }}>{likedCount}</span>
              <span style={{ color: "var(--superseller-text-muted)" }}> אהבתי</span>
            </span>
            <span>
              <span className="font-bold" style={{ color: "var(--superseller-orange)" }}>{dislikedCount}</span>
              <span style={{ color: "var(--superseller-text-muted)" }}> לא אהבתי</span>
            </span>
            <span className="mr-auto text-[11px] font-medium tabular-nums" style={{ color: "var(--superseller-text-accent)" }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--superseller-orange), var(--superseller-cyan), var(--superseller-blue))",
                boxShadow: progress > 0 ? "0 0 16px rgba(95, 251, 253, 0.4)" : "none",
              }}
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            {filterButtons.map(({ key, label, count, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                style={{
                  background: filter === key
                    ? "linear-gradient(135deg, var(--superseller-orange), var(--superseller-cyan))"
                    : "rgba(255,255,255,0.04)",
                  color: filter === key ? "white" : "var(--superseller-text-muted)",
                  border: filter === key ? "none" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: filter === key ? "0 4px 16px rgba(244, 121, 32, 0.2)" : "none",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                {label} <span className="opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Cards */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {filteredAds.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--superseller-text-muted)" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--superseller-text-muted)" }}>אין פרסומות בפילטר הזה</p>
          </div>
        ) : (
          filteredAds.map((ad, index) => (
            <div
              key={ad.id}
              className="animate-[superseller-fadeIn_0.5s_ease-out]"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s`, animationFillMode: "backwards" }}
            >
              <CompetitorAdCard
                ad={ad}
                onRate={handleRate}
                reviewerName={reviewerName}
              />
            </div>
          ))
        )}
      </div>

      {/* Completion banner */}
      {pending === 0 && total > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(135deg, var(--superseller-cyan), var(--superseller-blue))" }} />
            <div className="relative border border-white/10 rounded-2xl p-8 text-center ring-1 ring-inset ring-white/5" style={{ backdropFilter: "blur(20px)" }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--superseller-cyan), var(--superseller-blue))", boxShadow: "0 0 32px rgba(95, 251, 253, 0.3)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: "var(--superseller-text-primary)" }}>סיימתם!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--superseller-text-secondary)" }}>
                סקרתם את כל {total} הפרסומות. המשוב שלכם כבר מעצב את אסטרטגיית התוכן.
                <br />
                <span style={{ color: "var(--superseller-text-muted)" }}>אפשר לשנות דירוגים בכל עת.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer branding */}
      <div className="text-center py-8">
        <p className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--superseller-text-muted)", opacity: 0.3 }}>
          Powered by SuperSeller AI
        </p>
      </div>
    </div>
  );
}
