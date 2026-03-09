"use client";

import React, { useState } from "react";

interface CompetitorAd {
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
  liked?: boolean | null;
  feedbackNote?: string | null;
  feedbackBy?: string | null;
}

interface Props {
  ad: CompetitorAd;
  onRate: (adId: string, liked: boolean, feedbackNote: string, feedbackBy: string) => Promise<void>;
  reviewerName: string;
}

const tierConfig: Record<string, { he: string; color: string; bg: string }> = {
  evergreen: { he: "ירוקעד", color: "var(--superseller-cyan)", bg: "rgba(78, 205, 196, 0.15)" },
  winner: { he: "מנצחת", color: "var(--superseller-blue)", bg: "rgba(36, 148, 224, 0.15)" },
  strong: { he: "חזקה", color: "var(--superseller-orange)", bg: "rgba(244, 121, 32, 0.15)" },
  promising: { he: "מבטיחה", color: "var(--superseller-text-muted)", bg: "rgba(148, 163, 184, 0.1)" },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? "var(--superseller-cyan)" : score >= 5 ? "var(--superseller-orange)" : "var(--superseller-text-muted)";
  const bg = score >= 7 ? "rgba(78, 205, 196, 0.15)" : score >= 5 ? "rgba(244, 121, 32, 0.15)" : "rgba(148, 163, 184, 0.1)";
  const glow = score >= 7 ? "0 0 16px rgba(78, 205, 196, 0.3)" : score >= 5 ? "0 0 16px rgba(244, 121, 32, 0.2)" : "none";

  return (
    <div
      className="absolute bottom-3 left-3 w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black border border-white/10"
      style={{ background: bg, color, boxShadow: glow, backdropFilter: "blur(12px)" }}
    >
      {score}
    </div>
  );
}

export default function CompetitorAdCard({ ad, onRate, reviewerName }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [note, setNote] = useState(ad.feedbackNote ?? "");
  const [saving, setSaving] = useState(false);
  const [localLiked, setLocalLiked] = useState<boolean | null>(ad.liked ?? null);
  const [localNote, setLocalNote] = useState(ad.feedbackNote ?? "");
  const [saved, setSaved] = useState(false);

  const isReviewed = localLiked !== null;
  const tier = ad.longevityTier ? tierConfig[ad.longevityTier] : null;
  const score = ad.aiAnalysis?.overallScore;

  const handleRate = async (liked: boolean) => {
    setSaving(true);
    setSaved(false);
    try {
      setLocalLiked(liked);
      await onRate(ad.id, liked, note, reviewerName);
      setLocalNote(note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setLocalLiked(ad.liked ?? null);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (localLiked === null) return;
    setSaving(true);
    setSaved(false);
    try {
      await onRate(ad.id, localLiked, note, reviewerName);
      setLocalNote(note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Dynamic border/glow based on rating state
  const borderColor = localLiked === true
    ? "rgba(78, 205, 196, 0.35)"
    : localLiked === false
      ? "rgba(244, 121, 32, 0.25)"
      : "rgba(255, 255, 255, 0.06)";

  const glowShadow = localLiked === true
    ? "0 0 24px rgba(78, 205, 196, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
    : localLiked === false
      ? "0 0 24px rgba(244, 121, 32, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "inset 0 1px 0 rgba(255,255,255,0.04)";

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500 ring-1 ring-inset ring-white/[0.03]"
      style={{
        background: "rgba(22, 37, 64, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
      }}
    >
      {/* Media */}
      {(ad.imageUrl || ad.videoUrl) && (
        <div className="relative" style={{ background: "rgba(10, 22, 40, 0.5)" }}>
          {ad.videoUrl ? (
            <video
              src={ad.videoUrl}
              poster={ad.imageUrl ?? undefined}
              controls
              preload="metadata"
              className="w-full max-h-[420px] object-cover"
            />
          ) : ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.pageName ?? "Ad"}
              className="w-full max-h-[420px] object-cover"
              loading="lazy"
            />
          ) : null}

          {/* Top badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isReviewed && (
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10"
                style={{
                  background: localLiked ? "rgba(78, 205, 196, 0.85)" : "rgba(244, 121, 32, 0.85)",
                  backdropFilter: "blur(8px)",
                  color: "white",
                }}
              >
                {localLiked ? "אהבתי" : "לא אהבתי"}
              </span>
            )}
            {tier && (
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10"
                style={{ background: tier.bg, backdropFilter: "blur(8px)", color: tier.color }}
              >
                {tier.he}
              </span>
            )}
          </div>

          {/* Score */}
          {score != null && <ScoreBadge score={score} />}

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(22, 37, 64, 0.8), transparent)" }} />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            {ad.pageName && (
              <p className="text-sm font-bold truncate" style={{ color: "var(--superseller-text-primary)" }}>{ad.pageName}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {ad.startDate && (
                <p className="text-[11px]" style={{ color: "var(--superseller-text-muted)" }}>
                  פעילה מ-{ad.startDate}
                </p>
              )}
              {ad.daysRunning != null && ad.daysRunning > 0 && (
                <p className="text-[11px] font-semibold" style={{ color: "var(--superseller-text-accent)" }}>
                  {ad.daysRunning} ימים
                </p>
              )}
            </div>
          </div>
          {ad.adUrl && (
            <a
              href={ad.adUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
              style={{ color: "var(--superseller-text-muted)" }}
              title="צפה בפרסומת המקורית"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        {/* AI Analysis Tags */}
        {ad.aiAnalysis && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ad.aiAnalysis.hookType && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-white/5" style={{ background: "rgba(36, 148, 224, 0.1)", color: "var(--superseller-blue)" }}>
                הוק: {ad.aiAnalysis.hookType}
              </span>
            )}
            {ad.aiAnalysis.angle && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-white/5" style={{ background: "rgba(244, 121, 32, 0.1)", color: "var(--superseller-orange)" }}>
                זווית: {ad.aiAnalysis.angle}
              </span>
            )}
            {ad.aiAnalysis.emotionalTone && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-white/5" style={{ background: "rgba(78, 205, 196, 0.1)", color: "var(--superseller-cyan)" }}>
                טון: {ad.aiAnalysis.emotionalTone}
              </span>
            )}
            {ad.aiAnalysis.visualStyle && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-white/5" style={{ background: "rgba(95, 251, 253, 0.06)", color: "var(--superseller-neon)" }}>
                סגנון: {ad.aiAnalysis.visualStyle}
              </span>
            )}
          </div>
        )}

        {/* Ad title */}
        {ad.adTitle && (
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--superseller-text-primary)" }}>{ad.adTitle}</h3>
        )}

        {/* Ad text */}
        {ad.adText && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--superseller-text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {ad.adText}
          </p>
        )}

        {/* CTA tag */}
        {ad.ctaText && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "var(--superseller-text-secondary)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              CTA: {ad.ctaText}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />

        {/* Rating buttons */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => handleRate(true)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: localLiked === true
                ? "linear-gradient(135deg, var(--superseller-cyan), var(--superseller-blue))"
                : "rgba(255,255,255,0.03)",
              color: localLiked === true ? "white" : "var(--superseller-text-secondary)",
              border: localLiked === true ? "1px solid rgba(78, 205, 196, 0.3)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: localLiked === true ? "0 4px 20px rgba(78, 205, 196, 0.25)" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={localLiked === true ? "white" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
            </svg>
            {localLiked === true ? "אהבתי!" : "אהבתי"}
          </button>
          <button
            onClick={() => handleRate(false)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: localLiked === false
                ? "linear-gradient(135deg, var(--superseller-orange), #fe3d51)"
                : "rgba(255,255,255,0.03)",
              color: localLiked === false ? "white" : "var(--superseller-text-secondary)",
              border: localLiked === false ? "1px solid rgba(244, 121, 32, 0.3)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: localLiked === false ? "0 4px 20px rgba(244, 121, 32, 0.25)" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={localLiked === false ? "white" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
            </svg>
            {localLiked === false ? "לא מתאים" : "לא אהבתי"}
          </button>
        </div>

        {/* Feedback toggle */}
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="flex items-center gap-1.5 text-xs transition-all duration-200 hover:opacity-80 py-1"
          style={{ color: "var(--superseller-text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {showFeedback ? "הסתר הערות" : localNote ? "ערוך הערות" : "למה? (הוסף הערות)"}
        </button>

        {/* Feedback textarea */}
        {showFeedback && (
          <div className="mt-3 space-y-3 animate-[superseller-fadeIn_0.3s_ease-out]">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="מה אהבתם או לא אהבתם? איזה סגנון / טון / מסר עובד? מה לא?"
              rows={3}
              maxLength={2000}
              className="superseller-input w-full text-sm resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveNote}
                disabled={saving || localLiked === null}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: saved
                    ? "rgba(78, 205, 196, 0.15)"
                    : "linear-gradient(135deg, var(--superseller-blue), var(--superseller-neon))",
                  color: saved ? "var(--superseller-cyan)" : "white",
                  boxShadow: !saved && localLiked !== null ? "0 4px 16px rgba(36, 148, 224, 0.2)" : "none",
                }}
              >
                {saved ? "נשמר!" : "שמור הערות"}
              </button>
              {localLiked === null && (
                <p className="text-[11px]" style={{ color: "var(--superseller-text-muted)" }}>דרגו קודם, אחר כך שמרו הערות</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
