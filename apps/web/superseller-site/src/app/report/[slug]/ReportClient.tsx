"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ReportData {
  businessName: string;
  vertical: string;
  location: string | null;
  summary: Record<string, unknown> | null;
  ctaType: string;
  ctaUrl: string | null;
  ctaText: string;
  recommendedProduct: string | null;
  slug: string;
}

interface Ad {
  id: string;
  page_name: string;
  ad_copy: string | null;
  image_url: string | null;
  start_date: string | null;
  meta: Record<string, unknown> | null;
}

interface ReportSummary {
  whatWorks?: string[];
  patterns?: string[];
  gaps?: string[];
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
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
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Longevity Badge
// ---------------------------------------------------------------------------
function getLongevityTier(startDate: string | null): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (!startDate) return { label: "New", color: "text-gray-400", bgColor: "bg-gray-800" };
  const days = Math.floor(
    (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days >= 90) return { label: "Evergreen", color: "text-emerald-400", bgColor: "bg-emerald-950" };
  if (days >= 60) return { label: "Winner", color: "text-blue-400", bgColor: "bg-blue-950" };
  if (days >= 30) return { label: "Strong", color: "text-amber-400", bgColor: "bg-amber-950" };
  if (days >= 14) return { label: "Promising", color: "text-purple-400", bgColor: "bg-purple-950" };
  return { label: "New", color: "text-gray-400", bgColor: "bg-gray-800" };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function ReportClient({
  report,
  ads,
}: {
  report: ReportData;
  ads: Ad[];
}) {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const summary = (report.summary || {}) as ReportSummary;

  // Validate CTA URL — only allow https: and whatsapp: protocols
  const safeCtaUrl = (() => {
    if (!report.ctaUrl) return null;
    try {
      const url = new URL(report.ctaUrl);
      if (url.protocol === "https:" || url.protocol === "whatsapp:") return report.ctaUrl;
      return null;
    } catch {
      return null;
    }
  })();

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      slug: report.slug,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value || undefined,
    };

    try {
      const res = await fetch("/api/report/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }

      setFormState("success");
      form.reset();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setFormState("error");
    }
  }

  const hasFindings = (summary.whatWorks?.length || 0) + (summary.patterns?.length || 0) + (summary.gaps?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}
      <header className="relative pt-8 pb-16 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 bg-blue-500 rounded-full blur-[120px]" />

        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* SuperSeller branding */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TargetIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-400 tracking-wide uppercase">SuperSeller AI</span>
          </motion.div>

          {/* Vertical badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-300 border border-blue-800/50 mb-4">
              {report.vertical}
              {report.location && ` / ${report.location}`}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-5xl font-black leading-tight mb-4"
          >
            <span className="text-white">{report.businessName}</span>
            <br />
            <span className="text-blue-400">Competitor Ad Intelligence</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-400 max-w-2xl"
          >
            We analyzed your competitors&apos; active Facebook and Instagram ads. Here&apos;s what they&apos;re running, what&apos;s working, and where you can win.
          </motion.p>
        </motion.div>
      </header>

      {/* ================================================================= */}
      {/* KEY FINDINGS                                                      */}
      {/* ================================================================= */}
      {hasFindings && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* What Works */}
            {summary.whatWorks && summary.whatWorks.length > 0 && (
              <motion.div
                variants={fadeUp}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center">
                    <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-emerald-400">What Works</h3>
                </div>
                <ul className="space-y-3">
                  {summary.whatWorks.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">--</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Patterns */}
            {summary.patterns && summary.patterns.length > 0 && (
              <motion.div
                variants={fadeUp}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center">
                    <TargetIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-blue-400">Patterns</h3>
                </div>
                <ul className="space-y-3">
                  {summary.patterns.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">--</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Gaps */}
            {summary.gaps && summary.gaps.length > 0 && (
              <motion.div
                variants={fadeUp}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-amber-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center">
                    <AlertCircleIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-amber-400">Gaps &amp; Opportunities</h3>
                </div>
                <ul className="space-y-3">
                  {summary.gaps.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">--</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* ================================================================= */}
      {/* TOP ADS GALLERY                                                   */}
      {/* ================================================================= */}
      {ads.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <motion.h2
            className="text-2xl font-bold mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Top Competitor Ads ({ads.length})
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ads.map((ad) => {
              const tier = getLongevityTier(ad.start_date);
              const aiScore = ad.meta?.aiAnalysis
                ? (ad.meta.aiAnalysis as Record<string, unknown>)?.score
                : null;

              return (
                <motion.div
                  key={ad.id}
                  variants={scaleIn}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group"
                  whileHover={{ y: -4 }}
                >
                  {/* Ad Image */}
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    {ad.image_url ? (
                      <img
                        src={ad.image_url}
                        alt={`Ad by ${ad.page_name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">No preview</span>
                      </div>
                    )}

                    {/* Longevity badge */}
                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${tier.color} ${tier.bgColor}`}>
                      {tier.label}
                    </span>

                    {/* AI Score */}
                    {aiScore != null && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold text-blue-300 bg-blue-950/80 backdrop-blur-sm">
                        Score: {String(aiScore)}
                      </span>
                    )}
                  </div>

                  {/* Ad Details */}
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {ad.page_name}
                    </p>
                    {ad.ad_copy && (
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {ad.ad_copy.length > 120
                          ? ad.ad_copy.slice(0, 120) + "..."
                          : ad.ad_copy}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* ================================================================= */}
      {/* CTA SECTION                                                       */}
      {/* ================================================================= */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          className="bg-gradient-to-br from-blue-950 to-gray-900 border border-blue-800/30 rounded-2xl p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want this intelligence for <span className="text-blue-400">YOUR</span> competitors?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            We monitor competitor ads 24/7, analyze what&apos;s working, and deliver actionable insights so you can outperform them.
          </p>

          {report.ctaType === "whatsapp" && safeCtaUrl ? (
            <a
              href={safeCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-green-900/30"
            >
              <WhatsAppIcon className="w-6 h-6" />
              {report.ctaText}
            </a>
          ) : safeCtaUrl ? (
            <a
              href={safeCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-blue-900/30"
            >
              <ExternalLinkIcon className="w-5 h-5" />
              {report.ctaText}
            </a>
          ) : (
            <a
              href="#lead-capture"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-blue-900/30"
            >
              {report.ctaText}
            </a>
          )}
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* LEAD CAPTURE FORM                                                 */}
      {/* ================================================================= */}
      <section id="lead-capture" className="max-w-md mx-auto px-6 pb-20">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {formState === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-950 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">You&apos;re In</h3>
                <p className="text-gray-400">We&apos;ll send your first competitor update soon.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-bold mb-1 text-center">Get Weekly Competitor Updates</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Free weekly digest of new ads, trends, and opportunities in your market.
                </p>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="report-email" className="block text-sm font-medium text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="report-email"
                      name="email"
                      required
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="report-phone" className="block text-sm font-medium text-gray-400 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="report-phone"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <AnimatePresence>
                    {errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-400 text-center"
                      >
                        {errorMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={formState === "submitting"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formState === "submitting" ? "Subscribing..." : "Get Free Updates"}
                  </motion.button>

                  <p className="text-xs text-gray-600 text-center">
                    No spam. Unsubscribe anytime. Your data stays private.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER                                                            */}
      {/* ================================================================= */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center">
        <a
          href="https://superseller.agency"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <TargetIcon className="w-3 h-3 text-white" />
          </div>
          Powered by SuperSeller AI
        </a>
      </footer>
    </div>
  );
}
