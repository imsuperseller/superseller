"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { t, type CompeteLocale } from "./compete-i18n";
import { GOLD, THEME } from "./compete-theme";

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
  locale: CompeteLocale;
  compact?: boolean;
}

const TIER_EN: Record<string, { label: string; badge: string }> = {
  evergreen: { label: "Evergreen", badge: "superseller-badge-success" },
  winner:    { label: "Winner",    badge: "superseller-badge-info" },
  strong:    { label: "Strong",    badge: "superseller-badge-warning" },
  promising: { label: "Promising", badge: "superseller-badge-neon" },
};

const TIER_HE: Record<string, { label: string; badge: string }> = {
  evergreen: { label: "ירוקעד", badge: "superseller-badge-success" },
  winner:    { label: "מנצחת",  badge: "superseller-badge-info" },
  strong:    { label: "חזקה",   badge: "superseller-badge-warning" },
  promising: { label: "מבטיחה", badge: "superseller-badge-neon" },
};

// Tag translations — English tags are displayed as-is, Hebrew gets translated
const TAG_HE: Record<string, string> = {
  "text-overlay": "טקסט על וידאו", "raw-footage": "צילום גולמי", "before-after": "לפני-אחרי",
  "testimonial": "המלצה", "testimonial-video": "סרטון המלצה", "slideshow": "מצגת", "animation": "אנימציה", "talking-head": "דובר מול מצלמה",
  "product-demo": "הדגמת מוצר", "ugc": "תוכן גולשים", "meme": "מם", "carousel": "קרוסלה",
  "transformation": "טרנספורמציה", "project-showcase": "תצוגת פרויקט", "stock-photo": "תמונת סטוק", "video-thumbnail": "תמונה ממוזערת",
  "benefit-focused": "מוטה תועלת", "problem-solution": "בעיה-פתרון", "social-proof": "הוכחה חברתית",
  "urgency": "דחיפות", "curiosity": "סקרנות", "authority": "סמכות", "scarcity": "מחסור",
  "price-focused": "מחיר", "emotional": "רגשי", "educational": "חינוכי", "comparison": "השוואה",
  "story": "סיפור", "outcome": "תוצאה", "problem": "בעיה",
  "pain-focused": "מוטה כאב", "value-proposition": "הצעת ערך",
  "friendly": "ידידותי", "professional": "מקצועי", "urgent": "דחוף", "casual": "לא פורמלי",
  "inspirational": "מעורר השראה", "trustworthy": "אמין", "playful": "שובב", "serious": "רציני",
  "empathetic": "אמפתי", "bold": "נועז", "calm": "רגוע", "aspirational": "שאפתני",
  "cinematic": "קולנועי", "minimal": "מינימלי", "vibrant": "צבעוני", "dark": "כהה",
  "clean": "נקי", "luxury": "יוקרתי", "natural": "טבעי", "modern": "מודרני",
};

const TAG_EN: Record<string, string> = {
  "text-overlay": "Text Overlay", "raw-footage": "Raw Footage", "before-after": "Before/After",
  "testimonial": "Testimonial", "testimonial-video": "Video Testimonial", "slideshow": "Slideshow", "animation": "Animation", "talking-head": "Talking Head",
  "product-demo": "Product Demo", "ugc": "UGC", "meme": "Meme", "carousel": "Carousel",
  "transformation": "Transformation", "project-showcase": "Project Showcase", "stock-photo": "Stock Photo", "video-thumbnail": "Thumbnail",
  "benefit-focused": "Benefit-Focused", "problem-solution": "Problem/Solution", "social-proof": "Social Proof",
  "urgency": "Urgency", "curiosity": "Curiosity", "authority": "Authority", "scarcity": "Scarcity",
  "price-focused": "Price-Focused", "emotional": "Emotional", "educational": "Educational", "comparison": "Comparison",
  "story": "Story", "outcome": "Outcome", "problem": "Problem",
  "pain-focused": "Pain-Focused", "value-proposition": "Value Proposition",
  "friendly": "Friendly", "professional": "Professional", "urgent": "Urgent", "casual": "Casual",
  "inspirational": "Inspirational", "trustworthy": "Trustworthy", "playful": "Playful", "serious": "Serious",
  "empathetic": "Empathetic", "bold": "Bold", "calm": "Calm", "aspirational": "Aspirational",
  "cinematic": "Cinematic", "minimal": "Minimal", "vibrant": "Vibrant", "dark": "Dark",
  "clean": "Clean", "luxury": "Luxury", "natural": "Natural", "modern": "Modern",
};

function formatTag(val: string, locale: CompeteLocale): string | null {
  const lower = val.toLowerCase().trim();
  if (lower === "unknown" || lower === "n/a" || lower === "none" || lower === "missing" || !lower) return null;
  const map = locale === "he" ? TAG_HE : TAG_EN;
  return map[lower] || (locale === "en" ? val.charAt(0).toUpperCase() + val.slice(1).replace(/-/g, " ") : val);
}

export default function CompetitorAdCard({ ad, onRate, reviewerName, locale, compact = false }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [note, setNote] = useState(ad.feedbackNote ?? "");
  const [saving, setSaving] = useState(false);
  const [localLiked, setLocalLiked] = useState<boolean | null>(ad.liked ?? null);
  const [localNote, setLocalNote] = useState(ad.feedbackNote ?? "");
  const [saved, setSaved] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRTL = locale === "he";

  const isReviewed = localLiked !== null;
  const tierMap = locale === "he" ? TIER_HE : TIER_EN;
  const tier = ad.longevityTier ? tierMap[ad.longevityTier] : null;
  const score = ad.aiAnalysis?.overallScore;
  const hasVideo = ad.videoUrl && !videoError;
  const hasImage = ad.imageUrl && !imageError;
  const hasMedia = hasVideo || hasImage;
  const analysis = ad.aiAnalysis;

  const [pendingLiked, setPendingLiked] = useState<boolean | null>(null);
  const [noteError, setNoteError] = useState(false);

  const handleRate = async (liked: boolean) => {
    // Require a note before submitting
    if (!note.trim()) {
      setPendingLiked(liked);
      setShowFeedback(true);
      setNoteError(true);
      return;
    }
    setNoteError(false);
    setPendingLiked(null);
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
      <div className="group rounded-2xl overflow-hidden cursor-pointer" style={{ background: THEME.bgCard, border: `1px solid ${GOLD.borderSubtle}` }}>
        {hasMedia && (
          <div className="relative" style={{ background: THEME.bgSurface }}>
            {hasVideo ? (
              <video ref={videoRef} src={ad.videoUrl!} poster={!imageError ? ad.imageUrl ?? undefined : undefined} controls preload="metadata" className="w-full max-h-[200px] object-cover" onError={() => setVideoError(true)} />
            ) : (
              <img src={ad.imageUrl!} alt={ad.pageName ?? "Ad"} className="w-full max-h-[200px] object-cover" loading="lazy" onError={() => setImageError(true)} />
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold" style={{ color: THEME.text }}>{ad.pageName}</span>
            <span className="text-[11px] font-bold" style={{ color: localLiked ? GOLD.warm : THEME.pass }}>
              {localLiked ? t("liked", locale) : t("disliked", locale)}
            </span>
          </div>
          {localNote && <p className="text-[11px] mt-1" style={{ color: THEME.textMuted }}>{localNote}</p>}
        </div>
      </div>
    );
  }

  // ━━━ Full card ━━━
  return (
    <div className="relative group">
      {/* Glow orb behind card */}
      <div
        className="absolute -inset-1 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `linear-gradient(135deg, rgba(208,178,90,0.12), rgba(201,169,110,0.08))` }}
      />

      <div
        className="relative rounded-[24px] overflow-hidden backdrop-blur-xl"
        style={{ background: THEME.bgCard, border: `1px solid ${GOLD.borderSubtle}` }}
      >
        <div className="h-[2px] w-full" style={{ background: GOLD.gradientShimmer }} />

        {/* ── Social header row ── */}
        <div className={`flex items-center gap-3 px-5 pt-5 pb-3`} dir={isRTL ? "rtl" : "ltr"}>
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-black relative"
            style={{
              background: GOLD.gradient,
              color: "#fff",
              boxShadow: GOLD.glow,
            }}
          >
            {ad.pageName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold truncate" style={{ color: THEME.text }}>
                {ad.pageName || "Unknown"}
              </span>
              {tier && <span className={`${tier.badge} text-[10px] font-bold px-2 py-0.5`}>{tier.label}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {ad.daysRunning != null && ad.daysRunning > 0 && (
                <span className="text-[11px] font-semibold" style={{ color: GOLD.primary }}>
                  {ad.daysRunning} {t("days", locale)}
                </span>
              )}
              {ad.startDate && <span className="text-[11px]" style={{ color: THEME.textMuted }}>{ad.startDate}</span>}
              {score != null && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded"
                  style={{
                    color: score >= 7 ? GOLD.warm : score >= 5 ? THEME.pass : THEME.textMuted,
                    background: score >= 7 ? "rgba(78,205,196,0.12)" : score >= 5 ? "rgba(244,121,32,0.1)" : "rgba(148,163,184,0.08)",
                  }}
                >
                  {score}/10
                </span>
              )}
            </div>
          </div>
          {ad.adUrl && (
            <a href={ad.adUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer" style={{ color: THEME.textMuted }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>

        {/* ── Media / Text content ── */}
        {hasMedia ? (
          <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ background: THEME.bgSurface }}>
            {hasVideo ? (
              <video ref={videoRef} src={ad.videoUrl!} poster={!imageError ? ad.imageUrl ?? undefined : undefined} controls preload="metadata" className="w-full max-h-[400px] object-cover" onError={() => setVideoError(true)} />
            ) : (
              <img src={ad.imageUrl!} alt={ad.pageName ?? "Ad"} className="w-full max-h-[400px] object-cover" loading="lazy" onError={() => setImageError(true)} />
            )}
            {ad.videoUrl && videoError && hasImage && (
              <div className="absolute top-3 left-3 superseller-badge text-[10px]" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
                {t("videoUnavailable", locale)}
              </div>
            )}
          </div>
        ) : (
          <div className="relative mx-4 rounded-2xl overflow-hidden backdrop-blur-xl" style={{ background: "rgba(22,37,64,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-[0.06]" style={{ background: GOLD.primary }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-[0.04]" style={{ background: THEME.pass }} />
            <div className="h-[2px] w-full" style={{ background: GOLD.gradientShimmer }} />
            <div className="relative px-6 py-6" dir={isRTL ? "rtl" : "ltr"}>
              {ad.adTitle && (
                <h3 className="text-lg font-extrabold leading-snug mb-3" style={{ color: THEME.text, letterSpacing: "-0.01em" }}>
                  {ad.adTitle}
                </h3>
              )}
              {ad.adText && (
                <p
                  className="text-[15px] leading-[1.7]"
                  style={{
                    color: THEME.textSecondary,
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
                <p className="text-center py-6 text-sm" style={{ color: THEME.textMuted }}>{t("noTextContent", locale)}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Content below media ── */}
        <div className="px-5 pt-3 pb-2">
          {hasMedia && (ad.adTitle || ad.adText) && (
            <div dir={isRTL ? "rtl" : "ltr"} className="mb-3">
              {ad.adTitle && <h4 className="text-sm font-bold leading-snug mb-1" style={{ color: THEME.text }}>{ad.adTitle}</h4>}
              {ad.adText && (
                <p className="text-[13px] leading-relaxed" style={{ color: THEME.textMuted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ad.adText}
                </p>
              )}
            </div>
          )}

          {/* Analysis tags */}
          {analysis && (() => {
            const tags: { label: string; cls: string }[] = [];
            if (analysis.hookType) { const tag = formatTag(analysis.hookType, locale); if (tag) tags.push({ label: tag, cls: "superseller-badge-info" }); }
            if (analysis.emotionalTone) { const tag = formatTag(analysis.emotionalTone, locale); if (tag) tags.push({ label: tag, cls: "superseller-badge-success" }); }
            if (analysis.angle) { const tag = formatTag(analysis.angle, locale); if (tag) tags.push({ label: tag, cls: "superseller-badge-warning" }); }
            if (analysis.visualStyle) { const tag = formatTag(analysis.visualStyle, locale); if (tag) tags.push({ label: tag, cls: "superseller-badge-neon" }); }
            return tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3" dir={isRTL ? "rtl" : "ltr"}>
                {tags.map((tg, i) => <span key={i} className={`${tg.cls} text-[10px]`}>{tg.label}</span>)}
              </div>
            ) : null;
          })()}

          {ad.ctaText && (
            <div className="mb-3">
              <span className="superseller-badge-neon text-[11px]">{ad.ctaText}</span>
            </div>
          )}
        </div>

        {/* ── Rating section ── */}
        <div className="px-5 pb-5">
          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.04)" }} />

          <div className="flex gap-3">
            <button
              onClick={() => handleRate(true)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 cursor-pointer active:scale-[0.97] disabled:opacity-40"
              style={localLiked === true
                ? { background: GOLD.gradient, color: '#0e1225', boxShadow: GOLD.glow }
                : { color: GOLD.primary, border: `1px solid ${GOLD.border}`, background: GOLD.dimmer }
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={localLiked === true ? "#0e1225" : GOLD.primary} stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {localLiked === true ? t("likeActive", locale) : t("likeBtn", locale)}
            </button>
            <button
              onClick={() => handleRate(false)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 cursor-pointer active:scale-[0.97] disabled:opacity-40"
              style={localLiked === false
                ? { background: THEME.passGradient, color: '#fff' }
                : { color: THEME.pass, border: `1px solid ${THEME.passBorder}`, background: THEME.passLight }
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={localLiked === false ? "white" : THEME.pass} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {localLiked === false ? t("dislikeActive", locale) : t("passBtn", locale)}
            </button>
          </div>

          {!pendingLiked && (
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex items-center gap-1.5 mt-3 text-[11px] transition-all duration-300 py-1 cursor-pointer"
              style={{ color: THEME.textMuted }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {showFeedback ? t("hide", locale) : localNote ? t("editNote", locale) : t("addNote", locale)}
            </button>
          )}

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
                  {noteError && !note.trim() && (
                    <p className="text-[12px] font-semibold" style={{ color: THEME.pass }}>
                      {locale === "he" ? "חובה לכתוב סיבה לפני שליחה" : "A reason is required before submitting"}
                    </p>
                  )}
                  <textarea
                    value={note}
                    onChange={(e) => { setNote(e.target.value); if (e.target.value.trim()) setNoteError(false); }}
                    placeholder={locale === "he" ? "למה? (חובה)" : "Why? (required)"}
                    rows={2}
                    maxLength={2000}
                    autoFocus={!!pendingLiked}
                    className="superseller-input w-full text-sm resize-none rounded-xl px-4 py-3"
                    style={{
                      color: THEME.text,
                      borderColor: noteError && !note.trim() ? THEME.pass : undefined,
                    }}
                  />
                  {pendingLiked !== null ? (
                    <button
                      onClick={() => handleRate(pendingLiked)}
                      disabled={saving || !note.trim()}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-30 cursor-pointer hover:brightness-110 active:scale-[0.98]"
                      style={{ background: GOLD.gradient, color: '#0e1225', boxShadow: GOLD.glow }}
                    >
                      {locale === "he"
                        ? pendingLiked ? "שלח — אהבתי 💚" : "שלח — פאס ✕"
                        : pendingLiked ? "Submit — Liked 💚" : "Submit — Pass ✕"}
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNote}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-20 cursor-pointer hover:brightness-110"
                      style={saved ? { background: "rgba(208,178,90,0.15)", color: GOLD.warm } : { background: GOLD.dimmer, color: GOLD.primary, border: `1px solid ${GOLD.border}` }}
                    >
                      {saved ? t("saved", locale) : t("save", locale)}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
