"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  onRate: (adId: string, liked: boolean | null, feedbackNote: string, feedbackBy: string) => Promise<void>;
  reviewerName: string;
  compact?: boolean;
}

const TIER: Record<string, { he: string; badge: string }> = {
  evergreen: { he: "ירוקעד", badge: "superseller-badge-success" },
  winner:    { he: "מנצחת",  badge: "superseller-badge-info" },
  strong:    { he: "חזקה",   badge: "superseller-badge-warning" },
  promising: { he: "מבטיחה", badge: "superseller-badge-neon" },
};

// Hebrew translations for AI analysis tags
const TAG_HE: Record<string, string> = {
  // Hook types
  "text-overlay": "טקסט על וידאו", "raw-footage": "צילום גולמי", "before-after": "לפני-אחרי",
  "testimonial": "המלצה", "testimonial-video": "סרטון המלצה", "slideshow": "מצגת", "animation": "אנימציה", "talking-head": "דובר מול מצלמה",
  "product-demo": "הדגמת מוצר", "ugc": "תוכן גולשים", "meme": "מם", "carousel": "קרוסלה",
  "transformation": "טרנספורמציה", "project-showcase": "תצוגת פרויקט", "stock-photo": "תמונת סטוק", "video-thumbnail": "תמונה ממוזערת",
  // Angles
  "benefit-focused": "מוטה תועלת", "problem-solution": "בעיה-פתרון", "social-proof": "הוכחה חברתית",
  "urgency": "דחיפות", "curiosity": "סקרנות", "authority": "סמכות", "scarcity": "מחסור",
  "price-focused": "מחיר", "emotional": "רגשי", "educational": "חינוכי", "comparison": "השוואה",
  "story": "סיפור", "outcome": "תוצאה", "problem": "בעיה",
  "pain-focused": "מוטה כאב", "value-proposition": "הצעת ערך",
  // Tones
  "friendly": "ידידותי", "professional": "מקצועי", "urgent": "דחוף", "casual": "לא פורמלי",
  "inspirational": "מעורר השראה", "trustworthy": "אמין", "playful": "שובב", "serious": "רציני",
  "empathetic": "אמפתי", "bold": "נועז", "calm": "רגוע", "aspirational": "שאפתני",
  // Visual styles
  "cinematic": "קולנועי", "minimal": "מינימלי", "vibrant": "צבעוני", "dark": "כהה",
  "clean": "נקי", "luxury": "יוקרתי", "natural": "טבעי", "modern": "מודרני",
};

function heTag(val: string): string | null {
  const lower = val.toLowerCase().trim();
  if (lower === "unknown" || lower === "n/a" || lower === "none" || lower === "missing" || !lower) return null;
  return TAG_HE[lower] || val;
}

export default function CompetitorAdCard({ ad, onRate, reviewerName, compact = false }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [note, setNote] = useState(ad.feedbackNote ?? "");
  const [saving, setSaving] = useState(false);
  const [localLiked, setLocalLiked] = useState<boolean | null>(ad.liked ?? null);
  const [localNote, setLocalNote] = useState(ad.feedbackNote ?? "");
  const [saved, setSaved] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isReviewed = localLiked !== null;
  const tier = ad.longevityTier ? TIER[ad.longevityTier] : null;
  const score = ad.aiAnalysis?.overallScore;
  const hasVideo = ad.videoUrl && !videoError;
  const hasImage = ad.imageUrl && !imageError;
  const hasMedia = hasVideo || hasImage;
  const analysis = ad.aiAnalysis;

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

  // ━━━ Compact / history card ━━━
  if (compact) {
    return (
      <div className="superseller-card group rounded-2xl overflow-hidden cursor-pointer">
        {hasMedia && (
          <div className="relative" style={{ background: "var(--superseller-bg-surface)" }}>
            {hasVideo ? (
              <video ref={videoRef} src={ad.videoUrl!} poster={!imageError ? ad.imageUrl ?? undefined : undefined} controls preload="metadata" className="w-full max-h-[200px] object-cover" onError={() => setVideoError(true)} />
            ) : (
              <img src={ad.imageUrl!} alt={ad.pageName ?? "Ad"} className="w-full max-h-[200px] object-cover" loading="lazy" onError={() => setImageError(true)} />
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold" style={{ color: "var(--superseller-text-primary)" }}>{ad.pageName}</span>
            <span className="text-[11px] font-bold" style={{ color: localLiked ? "var(--superseller-teal)" : "var(--superseller-orange)" }}>
              {localLiked ? "אהבתי" : "לא אהבתי"}
            </span>
          </div>
          {localNote && <p className="text-[11px] mt-1" style={{ color: "var(--superseller-text-muted)" }}>{localNote}</p>}
        </div>
      </div>
    );
  }

  // ━━━ Full card ━━━
  return (
    <div className="relative group">
      {/* Glow orb behind card — intensifies on hover */}
      <div
        className="absolute -inset-1 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: "linear-gradient(135deg, rgba(244,121,32,0.12), rgba(95,251,253,0.12))" }}
      />

      <div
        className="superseller-card-neon relative rounded-[24px] overflow-hidden"
        style={{ background: "var(--superseller-bg-card)" }}
      >
        {/* Top accent gradient bar */}
        <div className="h-[2px] w-full" style={{ background: "var(--superseller-gradient-brand)" }} />

        {/* ── Social header row ── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3" dir="rtl">
          {/* Avatar with glow ring */}
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-black relative"
            style={{
              background: "linear-gradient(135deg, var(--superseller-orange), var(--superseller-teal))",
              color: "#fff",
              boxShadow: "0 0 20px rgba(244,121,32,0.25)",
            }}
          >
            {ad.pageName?.charAt(0).toUpperCase() || "?"}
          </div>
          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold truncate" style={{ color: "var(--superseller-text-primary)" }}>
                {ad.pageName || "Unknown"}
              </span>
              {tier && <span className={`${tier.badge} text-[10px] font-bold px-2 py-0.5`}>{tier.he}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {ad.daysRunning != null && ad.daysRunning > 0 && (
                <span className="text-[11px] font-semibold" style={{ color: "var(--superseller-cyan)" }}>
                  {ad.daysRunning} ימים
                </span>
              )}
              {ad.startDate && <span className="text-[11px]" style={{ color: "var(--superseller-text-muted)" }}>{ad.startDate}</span>}
              {score != null && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded"
                  style={{
                    color: score >= 7 ? "var(--superseller-teal)" : score >= 5 ? "var(--superseller-orange)" : "var(--superseller-text-muted)",
                    background: score >= 7 ? "rgba(78,205,196,0.12)" : score >= 5 ? "rgba(244,121,32,0.1)" : "rgba(148,163,184,0.08)",
                  }}
                >
                  {score}/10
                </span>
              )}
            </div>
          </div>
          {/* External link */}
          {ad.adUrl && (
            <a href={ad.adUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer" style={{ color: "var(--superseller-text-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>

        {/* ── Media / Text content ── */}
        {hasMedia ? (
          <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ background: "var(--superseller-bg-surface)" }}>
            {hasVideo ? (
              <video ref={videoRef} src={ad.videoUrl!} poster={!imageError ? ad.imageUrl ?? undefined : undefined} controls preload="metadata" className="w-full max-h-[400px] object-cover" onError={() => setVideoError(true)} />
            ) : (
              <img src={ad.imageUrl!} alt={ad.pageName ?? "Ad"} className="w-full max-h-[400px] object-cover" loading="lazy" onError={() => setImageError(true)} />
            )}
            {ad.videoUrl && videoError && hasImage && (
              <div className="absolute top-3 left-3 superseller-badge text-[10px]" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
                סרטון לא זמין
              </div>
            )}
          </div>
        ) : (
          /* Text-post card — glassmorphic text area */
          <div className="relative mx-4 rounded-2xl overflow-hidden backdrop-blur-xl" style={{ background: "rgba(22,37,64,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Inner glow */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-[0.06]" style={{ background: "var(--superseller-cyan)" }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-[0.04]" style={{ background: "var(--superseller-orange)" }} />

            {/* Accent gradient line at top */}
            <div className="h-[2px] w-full" style={{ background: "var(--superseller-gradient-brand)" }} />

            <div className="relative px-6 py-6" dir="rtl">
              {ad.adTitle && (
                <h3 className="text-lg font-extrabold leading-snug mb-3" style={{ color: "var(--superseller-text-primary)", letterSpacing: "-0.01em" }}>
                  {ad.adTitle}
                </h3>
              )}
              {ad.adText && (
                <p
                  className="text-[15px] leading-[1.7]"
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
              {!ad.adTitle && !ad.adText && (
                <p className="text-center py-6 text-sm" style={{ color: "var(--superseller-text-muted)" }}>אין תוכן טקסטואלי</p>
              )}
            </div>
          </div>
        )}

        {/* ── Content below media ── */}
        <div className="px-5 pt-3 pb-2">
          {/* Media cards: show title + text */}
          {hasMedia && (ad.adTitle || ad.adText) && (
            <div dir="rtl" className="mb-3">
              {ad.adTitle && <h4 className="text-sm font-bold leading-snug mb-1" style={{ color: "var(--superseller-text-primary)" }}>{ad.adTitle}</h4>}
              {ad.adText && (
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--superseller-text-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ad.adText}
                </p>
              )}
            </div>
          )}

          {/* Analysis tags — Hebrew, hide "unknown" */}
          {analysis && (() => {
            const tags: { label: string; cls: string }[] = [];
            if (analysis.hookType) { const t = heTag(analysis.hookType); if (t) tags.push({ label: t, cls: "superseller-badge-info" }); }
            if (analysis.emotionalTone) { const t = heTag(analysis.emotionalTone); if (t) tags.push({ label: t, cls: "superseller-badge-success" }); }
            if (analysis.angle) { const t = heTag(analysis.angle); if (t) tags.push({ label: t, cls: "superseller-badge-warning" }); }
            if (analysis.visualStyle) { const t = heTag(analysis.visualStyle); if (t) tags.push({ label: t, cls: "superseller-badge-neon" }); }
            return tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3" dir="rtl">
                {tags.map((t, i) => <span key={i} className={`${t.cls} text-[10px]`}>{t.label}</span>)}
              </div>
            ) : null;
          })()}

          {/* CTA pill */}
          {ad.ctaText && (
            <div className="mb-3">
              <span className="superseller-badge-neon text-[11px]">{ad.ctaText}</span>
            </div>
          )}
        </div>

        {/* ── Rating section ── */}
        <div className="px-5 pb-5">
          {/* Divider */}
          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.04)" }} />

          {/* 3D Rating buttons — using brand button system */}
          <div className="flex gap-3">
            <button
              onClick={() => handleRate(true)}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 cursor-pointer active:scale-[0.97] disabled:opacity-40 ${
                localLiked === true ? "superseller-btn-3d-primary" : "superseller-btn-3d-glass"
              }`}
              style={localLiked === true ? undefined : {
                color: "var(--superseller-teal)",
                border: "1px solid rgba(78,205,196,0.2)",
                background: "rgba(78,205,196,0.06)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={localLiked === true ? "white" : "var(--superseller-teal)"} stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {localLiked === true ? "אהבתי!" : "אהבתי"}
            </button>
            <button
              onClick={() => handleRate(false)}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 cursor-pointer active:scale-[0.97] disabled:opacity-40 ${
                localLiked === false ? "superseller-btn-3d-primary" : "superseller-btn-3d-glass"
              }`}
              style={localLiked === false ? { background: "linear-gradient(135deg, #dc2626, #f97316)" } : {
                color: "var(--superseller-orange)",
                border: "1px solid rgba(244,121,32,0.2)",
                background: "rgba(244,121,32,0.06)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={localLiked === false ? "white" : "var(--superseller-orange)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {localLiked === false ? "לא מתאים" : "פאס"}
            </button>
          </div>

          {/* Feedback toggle */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="flex items-center gap-1.5 mt-3 text-[11px] transition-all duration-300 hover:text-[var(--superseller-cyan)] py-1 cursor-pointer"
            style={{ color: "var(--superseller-text-muted)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {showFeedback ? "הסתר" : localNote ? "ערוך הערה" : "הוסף הערה"}
          </button>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="מה עובד? מה לא? למה?"
                    rows={2}
                    maxLength={2000}
                    className="superseller-input w-full text-sm resize-none rounded-xl px-4 py-3"
                    style={{ color: "var(--superseller-text-primary)" }}
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={saving}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-20 cursor-pointer ${
                      saved ? "" : "superseller-btn-3d-neon"
                    }`}
                    style={saved ? { background: "rgba(78,205,196,0.15)", color: "var(--superseller-teal)" } : undefined}
                  >
                    {saved ? "נשמר!" : "שמור"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
