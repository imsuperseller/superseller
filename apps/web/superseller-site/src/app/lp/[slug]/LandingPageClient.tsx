"use client";

import { useState, useEffect, useRef } from "react";
import type { LandingPage, Brand } from "@prisma/client";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";
import { MicroExpanderFAB } from "@/components/lp/MicroExpanderFAB";

// ---------------------------------------------------------------------------
// SVG Icons (no emoji per SuperSeller AI guidelines)
// ---------------------------------------------------------------------------
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated Counter Hook
// ---------------------------------------------------------------------------
function useAnimatedCounter(target: string, inView: boolean) {
  const [display, setDisplay] = useState(target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    // Extract numeric part
    const numMatch = target.match(/(\d+)/);
    if (!numMatch) {
      setDisplay(target);
      return;
    }
    const numericTarget = parseInt(numMatch[1], 10);
    const prefix = target.slice(0, numMatch.index);
    const suffix = target.slice((numMatch.index ?? 0) + numMatch[1].length);

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * numericTarget);
      setDisplay(`${prefix}${start}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, target]);

  return display;
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

const slideInFromSide = (isRTL: boolean): Variants => ({
  hidden: { opacity: 0, x: isRTL ? 40 : -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Sections {
  steps?: { title: string; description: string }[];
  testimonials?: { name: string; content: string; savings?: string }[];
  credentials?: { label: string; value: string }[];
  differentiators?: { title: string; description: string }[];
  gallery?: { url: string; alt: string }[];
  complianceFooter?: string;
}

// Map differentiator index to specific icon
const differentiatorIcons = [UsersIcon, AwardIcon, ShieldIcon];

// ---------------------------------------------------------------------------
// Credential Card with animated counter
// ---------------------------------------------------------------------------
function CredentialCard({
  label,
  value,
  primaryColor,
  index,
}: {
  label: string;
  value: string;
  primaryColor: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const animatedValue = useAnimatedCounter(value, isInView);

  return (
    <motion.div
      ref={ref}
      variants={scaleIn}
      className="text-center group"
    >
      <motion.div
        style={{ color: primaryColor }}
        className="font-black text-4xl md:text-5xl tabular-nums"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {animatedValue}
      </motion.div>
      <div className="text-sm mt-2 font-medium opacity-60">{label}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function LandingPageClient({ page }: { page: LandingPage & { brand: Brand | null } }) {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const sections = (page.sections || {}) as Sections;
  const isRTL = page.direction === "rtl";
  const isDark = page.theme === "dark";
  const isGlass = page.cardStyle === "glass";
  const fontFamily = page.brand?.fontFamily || "Heebo";
  const fontHeading = page.fontHeading || fontFamily;
  const fontFamilies = [fontFamily, ...(fontHeading !== fontFamily ? [fontHeading] : [])];
  const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${encodeURIComponent(f)}:wght@400;500;700;900`).join("&")}&display=swap`;
  const accent = page.brand?.accentColor || "#C9A96E";
  const primary = page.brand?.primaryColor || "#1e3a8a";
  const cta = page.brand?.ctaColor || "#f97316";

  // Analytics tracking pixel — fire pageview on mount, track conversions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: page.slug,
        type: "pageview",
        referrer: document.referrer || null,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      }),
    }).catch(() => {}); // fire-and-forget
  }, [page.slug]);

  function trackConversion(eventType: string, metadata?: Record<string, unknown>) {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, type: "conversion", eventType, metadata }),
    }).catch(() => {});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      slug: page.slug,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/leads/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }

      setFormState("success");
      trackConversion("form_submit");
      form.reset();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setFormState("error");
    }
  }

  const text = {
    formTitle: isRTL ? "השאירו פרטים לבדיקה חינם" : "Get Your Free Review",
    nameLabel: isRTL ? "שם מלא" : "Full Name",
    phoneLabel: isRTL ? "מספר טלפון" : "Phone",
    emailLabel: isRTL ? "דואר אלקטרוני" : "Email",
    privacy: isRTL
      ? "הפרטים שלך מאובטחים ולא יועברו לצד שלישי"
      : "Your details are secure and will not be shared with third parties",
    successTitle: isRTL ? "תודה!" : "Thank you!",
    successMsg: isRTL ? "נחזור אליך בהקדם" : "We'll get back to you soon",
    tryAgain: isRTL ? "נסו שוב" : "Try again",
    whatsappCTA: isRTL ? "שלחו הודעה בוואטסאפ" : "Chat on WhatsApp",
  };

  return (
    <>
      <link rel="stylesheet" href={fontUrl} />
      <div
        dir={page.direction}
        style={
          {
            fontFamily: `'${fontFamily}', sans-serif`,
            "--lp-accent": accent,
            "--lp-primary": primary,
            "--lp-cta": cta,
            "--lp-font-heading": `'${fontHeading}', serif`,
          } as React.CSSProperties
        }
        className={`min-h-screen antialiased overflow-x-hidden ${
          isDark
            ? "bg-[#0d0d0d] text-white"
            : "bg-slate-50 text-slate-800"
        }`}
      >
        {/* ============================================================= */}
        {/* HERO — staggered text reveal with blur-up animation            */}
        {/* ============================================================= */}
        <header
          style={{ backgroundColor: isDark ? "#111111" : primary }}
          className="relative pb-20 pt-12 px-6 text-white overflow-hidden"
        >
          {/* Video background when heroMediaUrl points to a video */}
          {page.heroMediaUrl && /\.(mp4|webm|mov)$/i.test(page.heroMediaUrl) && (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={page.heroMediaUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          {/* Subtle animated gradient overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${accent}, transparent 70%)`,
            }}
          />

          <motion.div
            className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {page.brand?.logoUrl && (
              <motion.img
                src={page.brand.logoUrl}
                alt={page.brand.name}
                className="h-16 w-auto mb-6 object-contain"
                variants={scaleIn}
              />
            )}
            <motion.h1
              style={{ fontFamily: `var(--lp-font-heading)` }}
              className="text-3xl md:text-5xl font-black mb-4 leading-tight max-w-3xl"
              variants={fadeUp}
            >
              {page.heroHeadline}
            </motion.h1>
            {page.heroSubheadline && (
              <motion.p
                className="text-lg md:text-xl font-medium opacity-90 mb-2 max-w-2xl"
                variants={fadeUp}
              >
                {page.heroSubheadline}
              </motion.p>
            )}
            {page.brand?.tagline && (
              <motion.p
                className="text-base opacity-75 mt-2"
                variants={fadeUp}
              >
                {page.brand.tagline}
              </motion.p>
            )}
          </motion.div>
        </header>

        {/* ============================================================= */}
        {/* LEAD FORM — spring animation on mount, animated state changes  */}
        {/* ============================================================= */}
        <section className="max-w-md mx-auto -mt-12 px-6 relative z-10">
          <motion.div
            className={`rounded-2xl shadow-xl overflow-hidden ${
              isDark && isGlass
                ? "bg-white/5 backdrop-blur-xl border border-white/10 ring-1 ring-white/5"
                : isDark
                  ? "bg-[#1a1a1a] border border-white/10"
                  : "bg-white border border-slate-100"
            }`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.4,
            }}
          >
            <div className="p-8">
              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-bold mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {text.successTitle}
                    </motion.h2>
                    <motion.p
                      className="text-slate-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {text.successMsg}
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2
                      style={{ fontFamily: `var(--lp-font-heading)` }}
                      className={`text-xl font-bold text-center mb-6 ${isDark ? "text-white" : ""}`}
                    >
                      {text.formTitle}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label
                          htmlFor="lp-name"
                          className={`block text-sm font-semibold mb-1 ${isDark ? "text-white/70" : "text-slate-600"}`}
                        >
                          {text.nameLabel}
                        </label>
                        <input
                          type="text"
                          id="lp-name"
                          name="name"
                          required
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-all duration-200 outline-none ${
                            isDark
                              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                              : "border-slate-200"
                          }`}
                          style={
                            {
                              "--tw-ring-color": accent,
                            } as React.CSSProperties
                          }
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <label
                          htmlFor="lp-phone"
                          className={`block text-sm font-semibold mb-1 ${isDark ? "text-white/70" : "text-slate-600"}`}
                        >
                          {text.phoneLabel}
                        </label>
                        <input
                          type="tel"
                          id="lp-phone"
                          name="phone"
                          required
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-all duration-200 outline-none ${
                            isDark
                              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                              : "border-slate-200"
                          }`}
                          style={
                            {
                              "--tw-ring-color": accent,
                            } as React.CSSProperties
                          }
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <label
                          htmlFor="lp-email"
                          className={`block text-sm font-semibold mb-1 ${isDark ? "text-white/70" : "text-slate-600"}`}
                        >
                          {text.emailLabel}
                        </label>
                        <input
                          type="email"
                          id="lp-email"
                          name="email"
                          required
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-all duration-200 outline-none ${
                            isDark
                              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                              : "border-slate-200"
                          }`}
                          style={
                            {
                              "--tw-ring-color": accent,
                            } as React.CSSProperties
                          }
                        />
                      </motion.div>

                      <AnimatePresence>
                        {errorMsg && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-red-600 text-center"
                          >
                            {errorMsg}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={formState === "submitting"}
                        className="w-full py-3 rounded-lg font-bold text-white transition-all duration-200"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: `0 10px 40px -10px ${cta}80`,
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        style={{ backgroundColor: cta }}
                      >
                        {formState === "submitting"
                          ? isRTL
                            ? "שולח..."
                            : "Sending..."
                          : page.ctaText}
                      </motion.button>

                      <motion.p
                        className={`text-xs text-center mt-3 flex items-center justify-center gap-1 ${isDark ? "text-white/40" : "text-slate-400"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        <ShieldIcon className="w-3 h-3 inline" />
                        {text.privacy}
                      </motion.p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* ============================================================= */}
        {/* STEPS — staggered slide-in with numbered timeline              */}
        {/* ============================================================= */}
        {sections.steps && sections.steps.length > 0 && (
          <section className="max-w-2xl mx-auto px-6 py-20 pb-28 sm:pb-20">
            <motion.div
              className="space-y-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {sections.steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={slideInFromSide(isRTL)}
                  className="flex items-start gap-4 group"
                >
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      style={{ backgroundColor: accent }}
                      className="w-11 h-11 rounded-full text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-md"
                      whileHover={{ scale: 1.15 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      {i + 1}
                    </motion.div>
                    {i < (sections.steps?.length ?? 0) - 1 && (
                      <motion.div
                        className="w-0.5 h-10 mt-1"
                        style={{ backgroundColor: `${accent}30` }}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      />
                    )}
                  </div>

                  <div className="pt-1.5 pb-4">
                    <h3
                      style={{ fontFamily: `var(--lp-font-heading)` }}
                      className="font-bold text-lg group-hover:translate-x-1 transition-transform duration-200"
                    >
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* TESTIMONIALS — card reveal with stagger                        */}
        {/* ============================================================= */}
        {sections.testimonials && sections.testimonials.length > 0 && (
          <section className={`py-20 px-6 ${isDark ? "bg-[#111111]" : "bg-white"}`}>
            <motion.div
              className="max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`rounded-xl p-6 transition-all duration-300 ${
                      isDark && isGlass
                        ? "bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 hover:shadow-lg"
                        : isDark
                          ? "bg-[#1a1a1a] border border-white/10 hover:border-white/20"
                          : "bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-slate-200"
                    }`}
                    whileHover={{ y: -4 }}
                  >
                    <p className={`mb-4 leading-relaxed ${isDark ? "text-white/80" : "text-slate-700"}`}>
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{t.name}</span>
                      {t.savings && (
                        <span
                          style={{ color: cta }}
                          className="font-bold text-sm"
                        >
                          {t.savings}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* GALLERY — portfolio image grid                                  */}
        {/* ============================================================= */}
        {sections.gallery && sections.gallery.length > 0 && (
          <section className={`py-20 px-6 ${isDark ? "bg-[#0d0d0d]" : "bg-slate-50"}`}>
            <motion.div
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.h2
                variants={fadeUp}
                style={{ fontFamily: `var(--lp-font-heading)` }}
                className={`text-2xl md:text-3xl font-black text-center mb-10 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {isRTL ? "מהעבודות שלנו" : "Our Work"}
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {sections.gallery.map((img, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* DIFFERENTIATORS — hover-lift cards with unique icons            */}
        {/* ============================================================= */}
        {sections.differentiators && sections.differentiators.length > 0 && (
          <section className={`py-20 px-6 ${isDark ? "bg-[#0d0d0d]" : "bg-white"}`}>
            <motion.div
              className="max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sections.differentiators.map((d, i) => {
                  const Icon = differentiatorIcons[i % differentiatorIcons.length];
                  return (
                    <motion.div
                      key={i}
                      variants={scaleIn}
                      className="text-center group cursor-default"
                      whileHover={{ y: -6 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <motion.div
                        style={{ color: accent }}
                        className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl group-hover:shadow-md transition-shadow duration-300 ${
                          isDark ? "bg-white/5" : "bg-slate-50"
                        }`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-7 h-7" />
                      </motion.div>
                      <h3
                        style={{ fontFamily: `var(--lp-font-heading)` }}
                        className="font-bold text-lg mb-2"
                      >
                        {d.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>
                        {d.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CREDENTIALS / TRUST BAR — animated counters                    */}
        {/* ============================================================= */}
        {sections.credentials && sections.credentials.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 py-16">
            <motion.div
              className="flex flex-wrap justify-center gap-10 md:gap-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {sections.credentials.map((c, i) => (
                <CredentialCard
                  key={i}
                  label={c.label}
                  value={c.value}
                  primaryColor={page.brand?.primaryColor || "#1e3a8a"}
                  index={i}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* FOOTER — fade in                                               */}
        {/* ============================================================= */}
        <motion.footer
          className={`py-8 px-6 text-center text-sm ${
            isDark ? "bg-[#0a0a0a] text-white/50" : "bg-slate-100 text-slate-500"
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            style={{ fontFamily: `var(--lp-font-heading)` }}
            className={`font-semibold mb-1 ${isDark ? "text-white/80" : "text-slate-700"}`}
          >
            {page.brand?.name || "SuperSeller Client"}
          </p>
          {page.phone && (
            <p className="flex items-center justify-center gap-1">
              <PhoneIcon className="w-3 h-3" />{" "}
              <span dir="ltr">{page.phone}</span>
            </p>
          )}
          {sections.complianceFooter && (
            <p className="mt-4 text-xs max-w-xl mx-auto leading-relaxed">
              {sections.complianceFooter}
            </p>
          )}
        </motion.footer>

        {/* ============================================================= */}
        {/* WHATSAPP FAB — MicroExpander from notebook design library       */}
        {/* ============================================================= */}
        {page.whatsappNumber && (
          <MicroExpanderFAB
            href={`https://wa.me/${page.whatsappNumber}`}
            text={text.whatsappCTA}
            icon={<WhatsAppIcon />}
            isRTL={isRTL}
            onClick={() => trackConversion("whatsapp_click")}
          />
        )}
      </div>
    </>
  );
}
