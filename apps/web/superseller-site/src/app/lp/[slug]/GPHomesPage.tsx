"use client";

import { useState, useEffect } from "react";
import type { LandingPage, Brand } from "@prisma/client";

// ---------------------------------------------------------------------------
// Brand — Light professional theme for home remodeling contractor
// ---------------------------------------------------------------------------
const NAVY = "#1B3A5C";
const NAVY_LIGHT = "#2A4F7A";
const ORANGE = "#E8863A";
const ORANGE_HOVER = "#D4782F";
const WHITE = "#FFFFFF";
const OFF_WHITE = "#F7F8FA";
const WARM_BG = "#FDF8F3";
const TEXT_DARK = "#1E293B";
const TEXT_MID = "#475569";
const TEXT_LIGHT = "#64748B";
const BORDER = "#E2E8F0";
const RED = "#EF4444";
const RED_BG = "#FEF2F2";
const YELLOW = "#F59E0B";
const YELLOW_BG = "#FFFBEB";
const GREEN = "#22C55E";
const GREEN_BG = "#F0FDF4";

// ---------------------------------------------------------------------------
// Reveal wrapper — pure CSS animation, SSR-safe
// ---------------------------------------------------------------------------
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className || ""} style={{ animation: `revealUp 0.7s ease-out ${delay}ms both` }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Tag (pill badge)
// ---------------------------------------------------------------------------
function SectionTag({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-6 rounded-full"
      style={{
        color: light ? WHITE : ORANGE,
        border: `1.5px solid ${light ? "rgba(255,255,255,0.3)" : ORANGE}`,
        background: light ? "rgba(255,255,255,0.1)" : "rgba(232,134,58,0.08)",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section Title
// ---------------------------------------------------------------------------
function SectionTitle({ text, accent, light = false }: { text: string; accent: string; light?: boolean }) {
  return (
    <h2
      className="text-3xl md:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-5"
      style={{ color: light ? WHITE : NAVY }}
    >
      {text}{" "}
      <span style={{ color: ORANGE }}>{accent}</span>
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={ORANGE}>
      <path d="M10 1l2.39 4.84L17.82 6.7l-3.91 3.81.92 5.39L10 13.34l-4.83 2.56.92-5.39L2.18 6.7l5.43-.86z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={ORANGE}>
      <path d="M10 0a10 10 0 110 20 10 10 0 010-20zm4.3 6.3a1 1 0 00-1.4 0L9 10.2 7.1 8.3a1 1 0 00-1.4 1.4l2.6 2.6a1 1 0 001.4 0l4.6-4.6a1 1 0 000-1.4z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={RED}>
      <path d="M10 0a10 10 0 110 20 10 10 0 010-20zm0 5a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={YELLOW}>
      <path d="M10 0a10 10 0 110 20 10 10 0 010-20zm0 5a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={TEXT_LIGHT} strokeWidth="2">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Track Conversion
// ---------------------------------------------------------------------------
function trackConversion(action: string) {
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "gp-homes-repairs", action, ts: Date.now() }),
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Severity Badge
// ---------------------------------------------------------------------------
function SeverityBadge({ level }: { level: "critical" | "warning" | "info" }) {
  const config = {
    critical: { bg: RED_BG, color: RED, border: "#FECACA", label: "Critical" },
    warning: { bg: YELLOW_BG, color: YELLOW, border: "#FDE68A", label: "Warning" },
    info: { bg: GREEN_BG, color: GREEN, border: "#BBF7D0", label: "OK" },
  };
  const c = config[level];
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function GPHomesPage({ page }: { page: LandingPage & { brand: Brand | null } }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = `https://wa.me/${page.whatsappNumber || "14695885133"}?text=${encodeURIComponent("Hi, I saw the GP Homes digital report and I'd like to discuss growing our online presence.")}`;
  const phoneUrl = page.phone ? `tel:${page.phone.replace(/\D/g, "")}` : "tel:+14695885133";

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to { width: var(--bar-width); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 4px 20px rgba(232,134,58,0.3); }
          50% { box-shadow: 0 4px 30px rgba(232,134,58,0.5); }
        }
        @keyframes gaugeGrow {
          from { stroke-dashoffset: 283; }
          to { stroke-dashoffset: var(--gauge-offset); }
        }
        .cta-btn:hover { transform: translateY(-2px); background: ${ORANGE_HOVER}; }
        .cta-btn { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .card-hover { transition: all 0.3s ease; }
        .code-block { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.7rem; line-height: 1.5; }
      `}</style>

      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: TEXT_DARK }}>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* ================================================================ */}
        {/* STICKY NAV */}
        {/* ================================================================ */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
            padding: scrolled ? "12px 0" : "20px 0",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-white text-sm"
                style={{ background: NAVY }}
              >
                GP
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: scrolled ? NAVY : WHITE }}>
                  Digital Presence Report
                </div>
                <div className="text-[0.65rem] font-medium" style={{ color: scrolled ? TEXT_LIGHT : "rgba(255,255,255,0.7)" }}>
                  GP Homes &amp; Repairs — March 2026
                </div>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversion("nav_cta_click")}
              className="cta-btn px-5 py-2.5 rounded-lg font-semibold text-sm text-white"
              style={{ background: ORANGE }}
            >
              Let&apos;s Talk
            </a>
          </div>
        </nav>

        {/* ================================================================ */}
        {/* HERO — Personalized pitch opener */}
        {/* ================================================================ */}
        <section
          className="relative min-h-[85vh] flex items-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0F2440 100%)` }}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(232,134,58,0.15) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(232,134,58,0.1) 0%, transparent 40%)`,
            }} />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 md:py-40">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left — Message */}
              <Reveal>
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
                    style={{ background: "rgba(232,134,58,0.15)", color: ORANGE, border: `1px solid rgba(232,134,58,0.3)` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: RED }} />
                    Confidential Business Intelligence Report
                  </div>

                  <h1 className="text-4xl md:text-[3.2rem] font-black text-white leading-[1.08] tracking-tight mb-6">
                    Nir, Your Work Is{" "}
                    <span style={{ color: ORANGE }}>Top 7%</span>
                    <br />
                    But Nobody Can Find You
                  </h1>

                  <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg">
                    We analyzed GP Homes&apos; entire digital footprint — website, Google Maps,
                    reviews, competitors, and social presence. Here&apos;s what we found.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackConversion("hero_whatsapp_click")}
                      className="cta-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white"
                      style={{ background: ORANGE, animation: "pulseBtn 3s ease-in-out infinite" }}
                    >
                      Discuss This Report
                    </a>
                    <a
                      href={phoneUrl}
                      onClick={() => trackConversion("hero_phone_click")}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition"
                    >
                      <PhoneIcon /> {page.phone || "Call Us"}
                    </a>
                  </div>
                </div>
              </Reveal>

              {/* Right — Digital Score Gauge */}
              <Reveal delay={300}>
                <div className="flex justify-center">
                  <div className="relative">
                    <svg width="260" height="260" viewBox="0 0 120 120">
                      {/* Background circle */}
                      <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                      {/* Score arc — 1.5/10 = 15% */}
                      <circle
                        cx="60" cy="60" r="45" fill="none"
                        stroke={RED}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        style={{ ["--gauge-offset" as any]: "240", strokeDashoffset: "240", animation: "gaugeGrow 2s ease-out 0.5s both" }}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl font-black text-white" style={{ animation: "countUp 0.8s ease-out 0.8s both" }}>1.5</div>
                      <div className="text-sm font-semibold text-white/40">/10</div>
                      <div className="text-xs font-bold mt-2" style={{ color: RED }}>Digital Presence Score</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE PARADOX — Quality vs Visibility */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>The Paradox</SectionTag>
              <SectionTitle text="World-Class Work," accent="Zero Online Visibility" />
              <p className="text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
                GP Homes has universal 5-star reviews across every platform — but the one platform
                that matters most, Google, doesn&apos;t know you exist.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left — What you HAVE */}
              <Reveal>
                <div className="rounded-xl p-8" style={{ background: GREEN_BG, border: `1px solid #BBF7D0` }}>
                  <div className="text-sm font-bold mb-6" style={{ color: GREEN }}>
                    What You Have (Quality)
                  </div>
                  <div className="space-y-4">
                    {[
                      { platform: "HomeAdvisor", rating: "5.0", count: "12 reviews" },
                      { platform: "Networx", rating: "5.0", count: "8 reviews" },
                      { platform: "BestProsInTown", rating: "5.0", count: "18 reviews" },
                      { platform: "Yelp", rating: "4.9", count: "33+ photos" },
                      { platform: "BuildZoom", rating: "Top 7%", count: "of 222,249 TX contractors" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-green-200 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: TEXT_DARK }}>{r.platform}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: GREEN }}>{r.rating}</span>
                          <span className="text-xs ml-1" style={{ color: TEXT_LIGHT }}>{r.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: GREEN }}>
                      Zero negative reviews found anywhere
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Right — What you DON'T have */}
              <Reveal delay={200}>
                <div className="rounded-xl p-8" style={{ background: RED_BG, border: `1px solid #FECACA` }}>
                  <div className="text-sm font-bold mb-6" style={{ color: RED }}>
                    What You&apos;re Missing (Visibility)
                  </div>
                  <div className="space-y-4">
                    {[
                      { item: "Google Reviews", value: "0", note: "The #1 trust signal" },
                      { item: "Google Maps Listing", value: "Not found", note: "Invisible in local pack" },
                      { item: "Instagram", value: "None", note: "0 social proof" },
                      { item: "TikTok / YouTube", value: "None", note: "Missing video presence" },
                      { item: "Facebook", value: "23 likes", note: "Last post: Oct 2024" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-red-200 last:border-0">
                        <div className="flex items-center gap-2">
                          <AlertIcon />
                          <span className="text-sm font-semibold" style={{ color: TEXT_DARK }}>{r.item}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: RED }}>{r.value}</span>
                          <span className="text-xs ml-1 block" style={{ color: TEXT_LIGHT }}>{r.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: RED }}>
                      Homeowners searching Google will never find you
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WEBSITE AUDIT — Real problems found */}
        {/* ================================================================ */}
        <section style={{ background: OFF_WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Website Audit</SectionTag>
              <SectionTitle text="We Visited gphomesandrepairs.com." accent="Here's What We Found." />
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Broken reviews page */}
              <Reveal>
                <div className="card-hover rounded-xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: RED_BG, borderBottom: `1px solid #FECACA` }}>
                    <div className="flex items-center gap-2">
                      <AlertIcon />
                      <span className="text-sm font-bold" style={{ color: RED }}>Broken Reviews Page</span>
                    </div>
                    <SeverityBadge level="critical" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
                      Your reviews page shows raw WordPress shortcode instead of actual reviews.
                      Visitors see this:
                    </p>
                    <div className="code-block rounded-lg p-4" style={{ background: "#1E293B", color: "#94A3B8" }}>
                      <span style={{ color: "#F97316" }}>[bne_testimonials_api</span>{" "}
                      source=&quot;google,local&quot;{" "}
                      id=&quot;ChIJPQ2jvsEjTIY...&quot;{" "}
                      layout=&quot;masonry&quot;{" "}
                      columns=&quot;2&quot;{" "}
                      schema_type=&quot;LocalBusiness&quot;
                      <span style={{ color: "#F97316" }}>]</span>
                    </div>
                    <p className="text-xs mt-3" style={{ color: RED }}>
                      Your 5-star reviews exist but customers can&apos;t see them.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Contact page 404 */}
              <Reveal delay={150}>
                <div className="card-hover rounded-xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: RED_BG, borderBottom: `1px solid #FECACA` }}>
                    <div className="flex items-center gap-2">
                      <AlertIcon />
                      <span className="text-sm font-bold" style={{ color: RED }}>Contact Page — 404 Error</span>
                    </div>
                    <SeverityBadge level="critical" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
                      Your &quot;Contact Us&quot; page returns a 404 error. Customers who click
                      it see &quot;Page not found&quot; and leave.
                    </p>
                    <div className="rounded-lg p-6 text-center" style={{ background: OFF_WHITE, border: `2px dashed ${BORDER}` }}>
                      <div className="text-4xl font-black mb-2" style={{ color: "#CBD5E1" }}>404</div>
                      <div className="text-sm" style={{ color: TEXT_LIGHT }}>Page not found</div>
                      <div className="text-xs mt-1" style={{ color: TEXT_LIGHT }}>gphomesandrepairs.com/contact-us/</div>
                    </div>
                    <p className="text-xs mt-3" style={{ color: RED }}>
                      Every visitor who clicks &quot;Contact Us&quot; is a lost lead.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* NAP Inconsistency */}
              <Reveal delay={300}>
                <div className="card-hover rounded-xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: YELLOW_BG, borderBottom: `1px solid #FDE68A` }}>
                    <div className="flex items-center gap-2">
                      <WarningIcon />
                      <span className="text-sm font-bold" style={{ color: "#B45309" }}>3 Different Phone Numbers</span>
                    </div>
                    <SeverityBadge level="warning" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
                      Google uses NAP (Name, Address, Phone) consistency to rank local businesses.
                      We found 3 different numbers across directories:
                    </p>
                    <div className="space-y-2">
                      {[
                        { source: "Website header", phone: "469-444-7777" },
                        { source: "HomeAdvisor", phone: "Different #" },
                        { source: "Other directories", phone: "Third variation" },
                      ].map((n, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: i === 0 ? GREEN_BG : RED_BG }}>
                          <span className="text-xs font-medium" style={{ color: TEXT_MID }}>{n.source}</span>
                          <span className="text-xs font-bold" style={{ color: i === 0 ? GREEN : RED }}>{n.phone}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-3" style={{ color: YELLOW }}>
                      NAP inconsistency directly kills Google Maps ranking.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Missing basics */}
              <Reveal delay={450}>
                <div className="card-hover rounded-xl overflow-hidden" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: YELLOW_BG, borderBottom: `1px solid #FDE68A` }}>
                    <div className="flex items-center gap-2">
                      <WarningIcon />
                      <span className="text-sm font-bold" style={{ color: "#B45309" }}>Missing Business Basics</span>
                    </div>
                    <SeverityBadge level="warning" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
                      Trust signals that homeowners expect on a contractor&apos;s website are absent:
                    </p>
                    <div className="space-y-2">
                      {[
                        "No physical address shown",
                        "No business hours listed",
                        "No email address visible",
                        "Copyright shows 2024 (outdated)",
                        "Duplicate content on homepage",
                        "BBB listed but NOT accredited",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm" style={{ color: TEXT_DARK }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: YELLOW }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* GOOGLE MAPS — You're invisible */}
        {/* ================================================================ */}
        <section style={{ background: NAVY }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag light>Google Maps</SectionTag>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight mb-5">
                We Searched <span style={{ color: ORANGE }}>&quot;Home Remodeling Plano TX&quot;</span>
              </h2>
              <p className="text-base max-w-2xl mx-auto text-white/60">
                This is what a Plano homeowner sees when they search for your exact service on Google Maps.
                GP Homes doesn&apos;t appear. Your competitors do.
              </p>
            </Reveal>

            {/* Simulated Google Maps search result */}
            <Reveal>
              <div className="rounded-xl overflow-hidden max-w-3xl mx-auto" style={{ background: WHITE, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
                {/* Search bar */}
                <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <SearchIcon />
                  <span className="text-sm" style={{ color: TEXT_DARK }}>home remodeling plano tx</span>
                </div>

                {/* Results */}
                <div className="divide-y" style={{ borderColor: BORDER }}>
                  {[
                    { name: "Toscana Remodeling", rating: "4.6", reviews: "104", type: "General contractor", status: "Sponsored" },
                    { name: "Modern Home Remodeling", rating: "5.0", reviews: "42", type: "Remodeler", status: "Open" },
                    { name: "DFW Improved", rating: "4.9", reviews: "210+", type: "Home improvement", status: "Open" },
                    { name: "Home Platinum Services", rating: "4.8", reviews: "98", type: "Custom cabinets", status: "Open" },
                  ].map((r, i) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: NAVY }}>{r.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>{r.rating}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} width="12" height="12" viewBox="0 0 20 20" fill={ORANGE}>
                                <path d="M10 1l2.39 4.84L17.82 6.7l-3.91 3.81.92 5.39L10 13.34l-4.83 2.56.92-5.39L2.18 6.7l5.43-.86z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: TEXT_LIGHT }}>({r.reviews})</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: TEXT_LIGHT }}>{r.type}</div>
                      </div>
                      {r.status === "Sponsored" && (
                        <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded" style={{ color: TEXT_LIGHT, background: OFF_WHITE }}>
                          Sponsored
                        </span>
                      )}
                    </div>
                  ))}

                  {/* GP Homes — NOT HERE */}
                  <div className="px-5 py-6 text-center" style={{ background: RED_BG }}>
                    <div className="text-sm font-bold mb-1" style={{ color: RED }}>
                      GP Homes and Repairs — Not found in results
                    </div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>
                      Top 7% of Texas contractors, 5-star reviews everywhere — but invisible where homeowners search.
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Key stat */}
            <Reveal delay={300} className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "rgba(232,134,58,0.15)", border: `1px solid rgba(232,134,58,0.3)` }}>
                <span className="text-sm font-bold" style={{ color: ORANGE }}>
                  46% of all Google searches have local intent — and the local 3-pack gets 44% of clicks.
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMPETITOR COMPARISON — Real data */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Competitor Intel</SectionTag>
              <SectionTitle text="Your Competitors Are" accent="Outranking You" />
              <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_MID }}>
                Not because their work is better — because they showed up on Google first.
              </p>
            </Reveal>

            {/* Competitor table */}
            <Reveal>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: OFF_WHITE }}>
                      <th className="text-left px-6 py-4 font-bold" style={{ color: NAVY }}>Competitor</th>
                      <th className="text-center px-4 py-4 font-bold" style={{ color: NAVY }}>Google Rating</th>
                      <th className="text-center px-4 py-4 font-bold" style={{ color: NAVY }}>Reviews</th>
                      <th className="text-left px-4 py-4 font-bold hidden md:table-cell" style={{ color: NAVY }}>Why They Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "DFW Improved", rating: "4.9", reviews: "210+", why: "Online visibility leader, aggressive review strategy", pct: 100 },
                      { name: "Toscana Remodeling", rating: "4.6", reviews: "104", why: "Google Ads + strong reviews", pct: 50 },
                      { name: "Home Platinum", rating: "4.8", reviews: "98", why: "Luxury positioning, review volume", pct: 47 },
                      { name: "Modern Home Remodeling", rating: "5.0", reviews: "42", why: "Perfect rating, active GBP", pct: 20 },
                      { name: "BRYJO Roofing", rating: "4.9", reviews: "31", why: "NARI award winner", pct: 15 },
                    ].map((c, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: BORDER }}>
                        <td className="px-6 py-4 font-semibold" style={{ color: NAVY }}>{c.name}</td>
                        <td className="text-center px-4 py-4">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-bold" style={{ color: TEXT_DARK }}>{c.rating}</span>
                            <StarIcon />
                          </div>
                        </td>
                        <td className="text-center px-4 py-4">
                          <div className="inline-flex items-center gap-2">
                            <div className="h-3 rounded-full" style={{
                              width: `${c.pct}px`,
                              background: `linear-gradient(90deg, ${NAVY}, ${NAVY_LIGHT})`,
                            }} />
                            <span className="font-bold text-xs" style={{ color: TEXT_DARK }}>{c.reviews}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs hidden md:table-cell" style={{ color: TEXT_LIGHT }}>{c.why}</td>
                      </tr>
                    ))}
                    {/* GP Homes row */}
                    <tr style={{ background: RED_BG, borderTop: `2px solid ${RED}` }}>
                      <td className="px-6 py-4 font-bold" style={{ color: RED }}>GP Homes &amp; Repairs</td>
                      <td className="text-center px-4 py-4 font-bold" style={{ color: RED }}>—</td>
                      <td className="text-center px-4 py-4 font-bold" style={{ color: RED }}>0</td>
                      <td className="px-4 py-4 text-xs font-bold hidden md:table-cell" style={{ color: RED }}>Not in Google Maps. Broken website. No social media.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* GOOGLE MAPS HACKS — What competitors are doing */}
        {/* ================================================================ */}
        <section style={{ background: WARM_BG }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Industry Intel</SectionTag>
              <SectionTitle text="How Top Contractors" accent="Hack Google Maps" />
              <p className="text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
                The contractors beating you on Google aren&apos;t just &quot;lucky&quot; — they&apos;re using
                specific technical strategies to dominate local search. Here&apos;s what&apos;s working in 2026.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "📍",
                  title: "Geo-Tagged Job Proof (DataPins)",
                  desc: "Contractor takes photo at jobsite → GPS coordinates auto-wrap in schema markup → proves to Google they work in cities where they don't have an office. The legitimate way to rank across your entire service area.",
                  impact: "High",
                  impactColor: GREEN,
                },
                {
                  icon: "🏗️",
                  title: "Building Permit Lead Alerts",
                  desc: "APIs like Shovels.ai monitor 185M+ building permits. Query for renovation/demolition permits filed in Plano — these homeowners are ACTIVELY planning projects. First contractor to reach them wins.",
                  impact: "Very High",
                  impactColor: GREEN,
                },
                {
                  icon: "🗺️",
                  title: "Geo-Grid Rank Tracking",
                  desc: "Tools like Local Falcon divide your service area into a grid and check ranking at each point. Creates a visual heat map showing exactly where you're visible vs invisible. Agencies use this to sell — and optimize.",
                  impact: "High",
                  impactColor: GREEN,
                },
                {
                  icon: "⭐",
                  title: "Competitor Review Mining",
                  desc: "AI scrapes competitor 1-2 star reviews → identifies their pain points → generates marketing that positions you against their exact weaknesses. \"They complained about delays? Show your on-time guarantee.\"",
                  impact: "High",
                  impactColor: GREEN,
                },
                {
                  icon: "🏠",
                  title: "Virtual Door-Knocking",
                  desc: "Satellite view identifies aged roofs, Street View spots exterior deterioration, county assessor data flags 1970s–80s builds. Cross-reference for targeted outreach to homes most likely to need renovation.",
                  impact: "Medium",
                  impactColor: ORANGE,
                },
                {
                  icon: "✅",
                  title: "Google Guaranteed Badge",
                  desc: "Google Local Service Ads appear ABOVE the map pack. Pay-per-lead ($25–$100/lead) with a \"Google Guaranteed\" badge = instant trust. Most contractors in Plano aren't using this yet.",
                  impact: "High",
                  impactColor: GREEN,
                },
              ].map((hack, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="card-hover rounded-xl p-6 flex flex-col h-full" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{hack.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold" style={{ color: NAVY }}>{hack.title}</h3>
                          <span
                            className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: hack.impactColor }}
                          >
                            {hack.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: TEXT_MID }}>{hack.desc}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={700} className="mt-10">
              <div className="rounded-xl p-6 text-center" style={{ background: WHITE, border: `2px solid ${ORANGE}` }}>
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  Agencies charge <span style={{ color: RED }}>$1,000–$2,000/mo</span> for basic GBP optimization alone.
                  <br />
                  Our plans include <span style={{ color: ORANGE }}>AI automation + permit alerts + competitor intel + geo-tracking</span> starting at $297/mo.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE OPPORTUNITY — Market data */}
        {/* ================================================================ */}
        <section style={{ background: OFF_WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>The Opportunity</SectionTag>
              <SectionTitle text="Plano Is the" accent="#1 Real Estate Market in America" />
              <p className="text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
                High-income homeowners in aging houses = massive remodeling demand.
                And they&apos;re all searching Google to find a contractor.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: "$146K", label: "Avg Household Income", sub: "Plano, TX" },
                { val: "$415K+", label: "Median Home Price", sub: "2025 data" },
                { val: "1970s", label: "Housing Stock Age", sub: "Prime remodel candidates" },
                { val: "$15K–$50K", label: "Per Kitchen Lead", sub: "Project value" },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div
                    className="card-hover text-center p-6 rounded-xl"
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: NAVY }}>{m.val}</div>
                    <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DARK }}>{m.label}</div>
                    <div className="text-[0.65rem]" style={{ color: TEXT_LIGHT }}>{m.sub}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={500} className="mt-10">
              <div className="rounded-xl p-6 text-center" style={{ background: WHITE, border: `2px solid ${ORANGE}` }}>
                <p className="text-base font-bold" style={{ color: NAVY }}>
                  Spring 2026 is peak booking season. Every week without Google visibility is{" "}
                  <span style={{ color: ORANGE }}>$15K–$50K in leads going to DFW Improved.</span>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PERSONAL VIDEO MESSAGE */}
        {/* ================================================================ */}
        {/* VIDEO PROMPT (25s, @shai-lfc):
            Medium shot of Shai (@shai-lfc) sitting at a modern desk with a laptop open,
            looking directly at camera with a confident, warm expression. He's wearing a
            dark navy polo shirt. Behind him a clean office setup with soft warm lighting.
            He speaks naturally and gestures occasionally — leaning slightly forward as if
            sharing something important with a friend. The energy is professional but
            personal, like a one-on-one conversation. Camera slowly pushes in from medium
            to tight medium shot over the 25 seconds. Shallow depth of field keeps focus
            on Shai. Natural daylight mixed with warm desk lamp. No text overlays.
        */}
        <section
          className="py-16 md:py-24"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0F2440 100%)` }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <Reveal className="text-center mb-10">
              <SectionTag light>Personal Message</SectionTag>
              <h2
                className="text-3xl md:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-4 text-white"
              >
                Nir, I Made This Report{" "}
                <span style={{ color: ORANGE }}>Specifically for You</span>
              </h2>
              <p className="text-base max-w-xl mx-auto text-white/60">
                25 seconds — hear why I believe GP Homes deserves to dominate Plano.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ border: `2px solid ${ORANGE}` }}>
                {/* Replace src with actual video URL after generation */}
                <video
                  id="shai-video"
                  controls
                  playsInline
                  preload="metadata"
                  poster=""
                  className="w-full aspect-video bg-black"
                  src=""
                >
                  Your browser does not support the video tag.
                </video>
                {/* Overlay shown when no video src yet */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
                  style={{ display: "flex" }}
                  id="video-placeholder"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: ORANGE }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">Video loading soon...</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT WE'LL DO — Concrete deliverables */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>The Plan</SectionTag>
              <SectionTitle text="Here's Exactly What" accent="We'll Do For You" />
              <p className="text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
                Not vague promises — specific, measurable actions with real deliverables.
              </p>
            </Reveal>

            <div className="space-y-6">
              {[
                {
                  phase: "Week 1–2",
                  title: "Fix What's Broken",
                  items: [
                    "Fix broken reviews page — show your actual 5-star reviews",
                    "Fix contact page 404 — restore lead capture",
                    "Standardize phone number (469-444-7777) across all directories",
                    "Add address, hours, email to website",
                    "Submit BBB accreditation application (~$600/yr, 2–4 week process)",
                  ],
                  color: RED,
                  bg: RED_BG,
                },
                {
                  phase: "Week 3–6",
                  title: "New Website + Google Maps Launch",
                  items: [
                    "Build brand-new modern website — mobile-first, fast, built to convert (not a WordPress patch)",
                    "Before/after project gallery, embedded Google reviews, trust badges (BuildZoom Top 7%, Licensed, BBB)",
                    "Service area pages for Plano, Frisco, Allen, McKinney, Richardson — each targets local search",
                    "LocalBusiness + Service schema markup (JSON-LD) + XML sitemap → Google understands your business",
                    "Claim + optimize Google Business Profile (category, description, photos, posts)",
                    "Launch Google review generation — QR codes at jobsite + automated follow-up sequences",
                    "Submit to 40+ local directories with consistent NAP",
                  ],
                  color: ORANGE,
                  bg: "rgba(232,134,58,0.06)",
                },
                {
                  phase: "Month 2+",
                  title: "Social Media Launch + Content Engine",
                  items: [
                    "Launch Instagram + Facebook with before/after project content",
                    "AI-generated social posts from your jobsite photos — you snap, we publish",
                    "Content calendar: 3–4 posts/week (before/after, tips, project spotlights, team)",
                    "Hashtag strategy targeting #PlanoRemodel #DFWContractor #KitchenRemodel",
                    "Review request automation after every completed job",
                    "Target: 25+ Google reviews in first 60 days",
                  ],
                  color: NAVY,
                  bg: "rgba(27,58,92,0.04)",
                },
                {
                  phase: "Ongoing",
                  title: "AI-Powered Lead Domination",
                  items: [
                    "Building permit monitoring — instant alerts when Plano homeowners file renovation permits",
                    "Geo-grid rank tracking — visual heat map of where you rank vs where you're invisible",
                    "Competitor review mining — AI scrapes their 1-2 star reviews, positions you against their weaknesses",
                    "Automated GBP posts with before/after project photos + geo-tags",
                    "Deploy geo-tagged job proof: photo at jobsite → GPS schema → proves your service area to Google",
                    "Monthly dashboard: ranking map, permit leads, competitor intel, review growth, social analytics",
                  ],
                  color: GREEN,
                  bg: GREEN_BG,
                },
              ].map((phase, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-4 px-6 py-4" style={{ background: phase.bg }}>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: phase.color }}
                      >
                        {phase.phase}
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: NAVY }}>{phase.title}</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                        {phase.items.map((item, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm" style={{ color: TEXT_DARK }}>
                            <div className="mt-0.5 flex-shrink-0"><CheckIcon /></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRICING */}
        {/* ================================================================ */}
        <section style={{ background: OFF_WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Investment</SectionTag>
              <SectionTitle text="Choose Your" accent="Growth Speed" />
              <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_MID }}>
                Every plan includes the emergency fixes. Choose how fast you want to dominate Plano.
              </p>
              <p className="text-xs mt-3" style={{ color: TEXT_LIGHT }}>
                Agencies charge $4,000–$10,000 for a website alone + $1,500–$3,000/mo for SEO. We bundle everything.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  tier: "Foundation",
                  price: "$297",
                  setup: "",
                  desc: "Fix + Monitor",
                  features: [
                    "Emergency website fixes",
                    "NAP standardization (40+ directories)",
                    "Weekly competitor monitoring",
                    "WhatsApp intelligence alerts",
                    "Basic Google Maps rank tracking",
                  ],
                  action: "pricing_foundation_click",
                },
                {
                  tier: "Growth",
                  price: "$597",
                  setup: "$1,500 one-time setup",
                  desc: "Maps + New Website",
                  features: [
                    "Everything in Foundation",
                    "Brand-new modern website (we build + host)",
                    "Google Business Profile setup",
                    "Review generation (QR + follow-ups)",
                    "Schema markup + service area pages",
                    "Geo-grid rank heat map dashboard",
                  ],
                  action: "pricing_growth_click",
                },
                {
                  tier: "Pro",
                  price: "$897",
                  setup: "$2,500 one-time setup",
                  desc: "Maps + Website + Social",
                  features: [
                    "Everything in Growth",
                    "Instagram + Facebook launch",
                    "3–4 AI-generated posts per week",
                    "Before/after content from your photos",
                    "Geo-tagged job proof system",
                    "AI review response drafts",
                    "Daily competitor monitoring",
                  ],
                  popular: true,
                  action: "pricing_pro_click",
                },
                {
                  tier: "Full Service",
                  price: "$1,297",
                  setup: "Setup fee waived",
                  desc: "Total Digital Takeover",
                  features: [
                    "Everything in Pro",
                    "Building permit lead alerts",
                    "Competitor review mining + positioning",
                    "Automated GBP posts + geo-tags",
                    "Bi-weekly strategy calls",
                    "Priority support + dedicated line",
                  ],
                  action: "pricing_fullservice_click",
                },
              ].map((p, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div
                    className="card-hover rounded-xl p-8 relative flex flex-col h-full"
                    style={{
                      background: p.popular ? NAVY : WHITE,
                      border: p.popular ? `2px solid ${ORANGE}` : `1px solid ${BORDER}`,
                      boxShadow: p.popular ? `0 8px 40px rgba(27,58,92,0.15)` : "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    {p.popular && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: ORANGE }}
                      >
                        Recommended
                      </div>
                    )}
                    <div className="text-sm font-bold mb-1" style={{ color: p.popular ? ORANGE : TEXT_LIGHT }}>
                      {p.tier}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: p.popular ? WHITE : NAVY }}>{p.price}</span>
                      <span className="text-sm" style={{ color: p.popular ? "rgba(255,255,255,0.5)" : TEXT_LIGHT }}>/mo</span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: p.popular ? "rgba(255,255,255,0.6)" : TEXT_MID }}>
                      {p.desc}
                    </p>
                    {p.setup && (
                      <p className="text-xs font-semibold mb-5" style={{ color: p.setup === "Setup fee waived" ? "#22C55E" : ORANGE }}>
                        {p.setup}
                      </p>
                    )}
                    {!p.setup && <div className="mb-6" />}
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm" style={{ color: p.popular ? "rgba(255,255,255,0.85)" : TEXT_DARK }}>
                          <CheckIcon /> {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackConversion(p.action)}
                      className="cta-btn block text-center w-full py-3 rounded-lg font-bold text-sm mt-auto"
                      style={{
                        background: p.popular ? ORANGE : "transparent",
                        color: p.popular ? WHITE : NAVY,
                        border: p.popular ? "none" : `2px solid ${NAVY}`,
                      }}
                    >
                      Let&apos;s Talk
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* ROI MATH */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <SectionTag>The Math</SectionTag>
              <SectionTitle text="One Kitchen Lead Pays for" accent="a Full Year" />
              <div
                className="rounded-xl p-8 mt-8"
                style={{ background: OFF_WHITE, border: `1px solid ${BORDER}` }}
              >
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: NAVY }}>$297–$1,297</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Monthly Investment</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: ORANGE }}>$15K–$50K</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Per Kitchen Lead</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: GREEN }}>12x–168x</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Return on Investment</div>
                  </div>
                </div>
                <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <p className="text-sm" style={{ color: TEXT_MID }}>
                    DFW Improved gets 210+ reviews worth of leads. At $15K per kitchen project,
                    even 5% of those leads = <strong style={{ color: NAVY }}>$150K+ in annual revenue</strong> that
                    should be going to you.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA */}
        {/* ================================================================ */}
        <section
          className="py-20 md:py-28"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0F2440 100%)` }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                Your Work Speaks for Itself.
                <br />
                <span style={{ color: ORANGE }}>Let&apos;s Make Sure People Hear It.</span>
              </h2>
              <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
                This report was prepared specifically for GP Homes. We&apos;d love to walk you
                through the findings and discuss next steps — no commitment required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackConversion("final_cta_whatsapp_click")}
                  className="cta-btn inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white"
                  style={{ background: ORANGE, animation: "pulseBtn 3s ease-in-out infinite" }}
                >
                  Discuss This Report
                </a>
                <a
                  href={phoneUrl}
                  onClick={() => trackConversion("final_cta_phone_click")}
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition"
                >
                  <PhoneIcon /> {page.phone || "Call Us"}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <footer style={{ background: "#0F172A" }} className="py-10">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs text-white/30 mb-2">
              Prepared by SuperSeller AI — Digital Presence Intelligence for Local Businesses
            </p>
            <p className="text-xs text-white/20">
              This report contains proprietary competitive intelligence. Please do not share publicly.
            </p>
          </div>
        </footer>

        {/* ================================================================ */}
        {/* FLOATING WhatsApp FAB */}
        {/* ================================================================ */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackConversion("fab_whatsapp_click")}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          style={{ background: "#25D366" }}
          aria-label="Contact via WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </>
  );
}
