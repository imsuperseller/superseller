"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import CompetitorAdCard from "./CompetitorAdCard";
import { t, tReplace, type CompeteLocale } from "./compete-i18n";
import { GOLD, THEME } from "./compete-theme";

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

interface Props {
  tenantSlug: string;
  userName: string;
  locale: CompeteLocale;
}

export default function CompeteFeed({ tenantSlug, userName, locale }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewerName] = useState(userName);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const isRTL = locale === "he";

  const pendingAds = ads.filter((a) => a.liked === null);
  const reviewedAds = ads.filter((a) => a.liked !== null);
  const total = ads.length;
  const reviewed = reviewedAds.length;
  const likedCount = ads.filter((a) => a.liked === true).length;
  const dislikedCount = ads.filter((a) => a.liked === false).length;
  const currentAd = pendingAds[currentIndex] ?? null;
  const isComplete = pendingAds.length === 0 && total > 0;

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

  const handleRate = useCallback(
    async (adId: string, liked: boolean | null, feedbackNote: string, feedbackBy: string) => {
      const isRating = liked !== null;
      if (isRating) setExitDir(liked ? "right" : "left");

      const res = await fetch(`/api/compete/ads/${tenantSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, liked, feedbackNote, feedbackBy }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        if (isRating) setExitDir(null);
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

      if (isRating) {
        await new Promise((r) => setTimeout(r, 400));
        setExitDir(null);
        setCardKey((k) => k + 1);
        setCurrentIndex((prev) => {
          const newPending = ads.filter((a) => a.id !== adId && a.liked === null);
          return Math.min(prev, Math.max(0, newPending.length - 1));
        });
      }
    },
    [tenantSlug, ads]
  );

  const goNext = () => {
    if (currentIndex < pendingAds.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardKey((k) => k + 1);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCardKey((k) => k + 1);
    }
  };

  const displayName = tenantSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // ─── Loading ───
  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col items-center justify-center" style={{ background: THEME.bg }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--superseller-cyan)", borderRightColor: "var(--superseller-orange)" }} />
        <p className="text-sm mt-5" style={{ color: THEME.textMuted }}>{t("loading", locale)}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center px-4" style={{ background: THEME.bg }}>
        <div className="superseller-card rounded-2xl p-8 max-w-md w-full text-center" style={{ borderColor: "rgba(220,38,38,0.2)" }}>
          <p className="font-semibold" style={{ color: "#ef4444" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center px-4" style={{ background: THEME.bg }}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: THEME.text }}>{t("noAdsYet", locale)}</h2>
          <p className="text-sm" style={{ color: THEME.textMuted }}>{tReplace("adsNotCollected", locale, { name: displayName })}</p>
        </div>
      </div>
    );
  }

  // ─── History ───
  if (showHistory) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen" style={{ background: THEME.bg }}>
        <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between backdrop-blur-xl" style={{ background: "rgba(13,27,46,0.9)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <button onClick={() => setShowHistory(false)} className="superseller-btn-3d-neon flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={isRTL ? "M19 12H5M12 19l-7-7 7-7" : "M5 12H19M12 5l7 7-7 7"}/></svg>
            {t("back", locale)}
          </button>
          <span className="text-[11px] font-semibold" style={{ color: THEME.textMuted }}>{reviewed} {t("ratings", locale)}</span>
        </div>
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {reviewedAds.map((ad, idx) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <CompetitorAdCard ad={ad} onRate={handleRate} reviewerName={reviewerName} locale={locale} compact />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Complete ───
  if (isComplete) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: THEME.bg }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.1]" style={{ background: GOLD.primary }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-sm relative"
        >
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center superseller-animate-glow"
            style={{
              background: GOLD.gradient,
              boxShadow: GOLD.glowStrong,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-3xl font-black mb-3" style={{ color: THEME.text }}>{t("done", locale)}</h2>
          <p className="text-base mb-2" style={{ color: "var(--superseller-text-secondary)" }}>
            {t("reviewed", locale)} <span className="font-black" style={{ color: GOLD.primary }}>{total}</span> {t("postsWord", locale)}
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <span className="text-sm"><span className="font-black" style={{ color: GOLD.warm }}>{likedCount}</span> <span style={{ color: THEME.textMuted }}>{t("liked", locale)}</span></span>
            <span className="text-sm"><span className="font-black" style={{ color: "var(--superseller-orange)" }}>{dislikedCount}</span> <span style={{ color: THEME.textMuted }}>{t("disliked", locale)}</span></span>
          </div>
          <button onClick={() => setShowHistory(true)} className="superseller-btn-3d-neon px-6 py-3 rounded-xl text-sm font-bold cursor-pointer">
            {t("viewRatings", locale)}
          </button>
          <p className="mt-8 text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--superseller-text-muted)", opacity: 0.2 }}>SuperSeller AI</p>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN FEED ───
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col relative" style={{ background: THEME.bg }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[400px] rounded-full blur-[150px] opacity-[0.05]" style={{ background: GOLD.primary }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[350px] rounded-full blur-[120px] opacity-[0.03]" style={{ background: GOLD.warm }} />
      </div>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 px-4 py-3 backdrop-blur-xl" style={{ background: "rgba(13,27,46,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black" style={{ color: THEME.text }}>{displayName}</h1>
            <p className="text-[10px] font-semibold" style={{ color: THEME.textMuted }}>
              {total} {t("posts", locale)} &middot; {pendingAds.length} {t("pending", locale)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md" style={{ background: GOLD.dimmer, border: `1px solid ${GOLD.border}` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={GOLD.primary} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span className="text-[12px] font-black" style={{ color: GOLD.primary }}>{likedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md" style={{ background: THEME.passLight, border: `1px solid ${THEME.passBorder}` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.pass} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span className="text-[12px] font-black" style={{ color: THEME.pass }}>{dislikedCount}</span>
            </div>
            {reviewed > 0 && (
              <button onClick={() => setShowHistory(true)} className="superseller-btn-3d-neon text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer">
                {t("history", locale)}
              </button>
            )}
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((reviewed) / total) * 100}%`,
                background: GOLD.gradientShimmer,
                boxShadow: `0 0 12px rgba(208,178,90,0.4)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Card area ── */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-6 relative">
        <div className="max-w-lg w-full relative">
          {currentIndex > 0 && (
            <button onClick={goPrev} className={`absolute ${isRTL ? "-right-14" : "-left-14"} top-48 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-md hover:bg-white/[0.06] transition-all duration-300 hidden lg:flex`} style={{ color: "var(--superseller-text-muted)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={isRTL ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/></svg>
            </button>
          )}
          {currentIndex < pendingAds.length - 1 && (
            <button onClick={goNext} className={`absolute ${isRTL ? "-left-14" : "-right-14"} top-48 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-md hover:bg-white/[0.06] transition-all duration-300 hidden lg:flex`} style={{ color: "var(--superseller-text-muted)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={isRTL ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}/></svg>
            </button>
          )}

          <div
            style={{
              transform: exitDir === "right"
                ? "translateX(120%) rotate(6deg)"
                : exitDir === "left"
                  ? "translateX(-120%) rotate(-6deg)"
                  : undefined,
              opacity: exitDir ? 0 : undefined,
              transition: exitDir ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease" : undefined,
            }}
          >
            <motion.div
              key={cardKey}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {currentAd && (
                <CompetitorAdCard
                  ad={currentAd}
                  onRate={handleRate}
                  reviewerName={reviewerName}
                  locale={locale}
                />
              )}
            </motion.div>
          </div>

          {pendingAds.length > 1 && (
            <div className="flex justify-center mt-3">
              <button
                onClick={goNext}
                disabled={currentIndex >= pendingAds.length - 1}
                className="superseller-btn-3d-glass text-[11px] font-semibold px-4 py-2 rounded-full cursor-pointer disabled:opacity-20"
                style={{ color: THEME.textMuted }}
              >
                {t("skip", locale)} {isRTL ? "\u2190" : "\u2192"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
