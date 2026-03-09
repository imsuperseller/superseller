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

const tierLabels: Record<string, { he: string; color: string }> = {
  evergreen: { he: "ירוקעד", color: "#4ecdc4" },
  winner: { he: "מנצחת", color: "#2494e0" },
  strong: { he: "חזקה", color: "#f47920" },
  promising: { he: "מבטיחה", color: "#b0bec5" },
};

export default function CompetitorAdCard({ ad, onRate, reviewerName }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [note, setNote] = useState(ad.feedbackNote ?? "");
  const [saving, setSaving] = useState(false);
  const [localLiked, setLocalLiked] = useState<boolean | null>(ad.liked ?? null);
  const [localNote, setLocalNote] = useState(ad.feedbackNote ?? "");
  const [saved, setSaved] = useState(false);

  const isReviewed = localLiked !== null;
  const tier = ad.longevityTier ? tierLabels[ad.longevityTier] : null;
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

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        background: "rgba(22, 37, 64, 0.6)",
        backdropFilter: "blur(16px)",
        border: localLiked === true
          ? "1px solid rgba(78, 205, 196, 0.4)"
          : localLiked === false
            ? "1px solid rgba(244, 121, 32, 0.3)"
            : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: localLiked === true
          ? "0 0 20px rgba(78, 205, 196, 0.1)"
          : localLiked === false
            ? "0 0 20px rgba(244, 121, 32, 0.1)"
            : "none",
      }}
    >
      {/* Media */}
      {(ad.imageUrl || ad.videoUrl) && (
        <div className="relative">
          {ad.videoUrl ? (
            <video
              src={ad.videoUrl}
              poster={ad.imageUrl ?? undefined}
              controls
              preload="metadata"
              className="w-full max-h-[420px] object-cover"
              style={{ background: "#0a1628" }}
            />
          ) : ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.pageName ?? "Ad"}
              className="w-full max-h-[420px] object-cover"
            />
          ) : null}

          {/* Badges overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isReviewed && (
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white"
                style={{
                  background: localLiked ? "rgba(78, 205, 196, 0.9)" : "rgba(244, 121, 32, 0.9)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {localLiked ? "אהבתי" : "לא אהבתי"}
              </span>
            )}
            {tier && (
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  color: tier.color,
                }}
              >
                {tier.he}
              </span>
            )}
          </div>

          {/* AI Score badge */}
          {score != null && (
            <div
              className="absolute bottom-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{
                background: score >= 7 ? "rgba(78, 205, 196, 0.9)" : score >= 5 ? "rgba(244, 121, 32, 0.9)" : "rgba(148, 163, 184, 0.9)",
                backdropFilter: "blur(8px)",
                boxShadow: `0 0 12px ${score >= 7 ? "rgba(78,205,196,0.4)" : "rgba(244,121,32,0.3)"}`,
              }}
            >
              {score}/10
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            {ad.pageName && (
              <p className="text-sm font-bold text-white">{ad.pageName}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {ad.startDate && (
                <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                  פעילה מ-{ad.startDate}
                </p>
              )}
              {ad.daysRunning != null && ad.daysRunning > 0 && (
                <p className="text-[11px] font-medium" style={{ color: "#5ffbfd" }}>
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
              className="transition-colors"
              style={{ color: "#94a3b8" }}
              title="צפה בפרסומת המקורית"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(36, 148, 224, 0.15)", color: "#2494e0" }}>
                הוק: {ad.aiAnalysis.hookType}
              </span>
            )}
            {ad.aiAnalysis.angle && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(244, 121, 32, 0.15)", color: "#f47920" }}>
                זווית: {ad.aiAnalysis.angle}
              </span>
            )}
            {ad.aiAnalysis.emotionalTone && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4" }}>
                טון: {ad.aiAnalysis.emotionalTone}
              </span>
            )}
            {ad.aiAnalysis.visualStyle && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(95, 251, 253, 0.1)", color: "#5ffbfd" }}>
                סגנון: {ad.aiAnalysis.visualStyle}
              </span>
            )}
          </div>
        )}

        {/* Ad title */}
        {ad.adTitle && (
          <h3 className="text-sm font-semibold text-white mb-2">{ad.adTitle}</h3>
        )}

        {/* Ad text */}
        {ad.adText && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#b0bec5", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {ad.adText}
          </p>
        )}

        {/* CTA */}
        {ad.ctaText && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#b0bec5", border: "1px solid rgba(255,255,255,0.08)" }}>
              CTA: {ad.ctaText}
            </span>
          </div>
        )}

        {/* Rating buttons */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => handleRate(true)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: localLiked === true
                ? "linear-gradient(135deg, #4ecdc4, #2494e0)"
                : "rgba(255,255,255,0.05)",
              color: localLiked === true ? "white" : "#b0bec5",
              border: localLiked === true ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: localLiked === true ? "0 0 16px rgba(78, 205, 196, 0.3)" : "none",
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: localLiked === false
                ? "linear-gradient(135deg, #f47920, #fe3d51)"
                : "rgba(255,255,255,0.05)",
              color: localLiked === false ? "white" : "#b0bec5",
              border: localLiked === false ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: localLiked === false ? "0 0 16px rgba(244, 121, 32, 0.3)" : "none",
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
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "#94a3b8" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {showFeedback ? "הסתר הערות" : localNote ? "ערוך הערות" : "למה? (הוסף הערות)"}
        </button>

        {/* Feedback textarea */}
        {showFeedback && (
          <div className="mt-3 space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="מה אהבתם או לא אהבתם? איזה סגנון / טון / מסר עובד? מה לא?"
              rows={3}
              maxLength={2000}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveNote}
                disabled={saving || localLiked === null}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-30"
                style={{
                  background: saved ? "rgba(78, 205, 196, 0.2)" : "linear-gradient(135deg, #2494e0, #5ffbfd)",
                  color: saved ? "#4ecdc4" : "white",
                }}
              >
                {saved ? "נשמר!" : "שמור הערות"}
              </button>
              {localLiked === null && (
                <p className="text-[11px]" style={{ color: "#94a3b8" }}>דרגו קודם, אחר כך שמרו הערות</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
