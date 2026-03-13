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

const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/gp-homes-repairs/portfolio";

const PHOTOS = {
  heroKitchen: `${R2}/hero-kitchen-remodel.jpg`,
  bathroom: `${R2}/bathroom-renovation.jpg`,
  roomAddition: `${R2}/room-addition.jpg`,
  exterior: `${R2}/exterior-renovation.jpg`,
  flooring: `${R2}/flooring-install.jpg`,
  garage: `${R2}/garage-conversion.jpg`,
};

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
    <svg width="20" height="20" viewBox="0 0 20 20" fill={ORANGE}>
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

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
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
// Main Component
// ---------------------------------------------------------------------------
export function GPHomesPage({ page }: { page: LandingPage & { brand: Brand | null } }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = `https://wa.me/14694447777?text=${encodeURIComponent("Hi, I saw the GP Homes report and I'd like to learn more about growing my online presence.")}`;
  const phoneUrl = "tel:+14694447777";

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
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to { width: var(--bar-width); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 4px 20px rgba(232,134,58,0.3); }
          50% { box-shadow: 0 4px 30px rgba(232,134,58,0.5); }
        }
        .gallery-img:hover { transform: scale(1.03); }
        .gallery-img { transition: transform 0.4s ease; }
        .cta-btn:hover { transform: translateY(-2px); background: ${ORANGE_HOVER}; }
        .cta-btn { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .card-hover { transition: all 0.3s ease; }
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
                  GP Homes &amp; Repairs
                </div>
                <div className="text-[0.65rem] font-medium" style={{ color: scrolled ? TEXT_LIGHT : "rgba(255,255,255,0.7)" }}>
                  Top 7% Texas Contractors
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
              Free Estimate
            </a>
          </div>
        </nav>

        {/* ================================================================ */}
        {/* HERO — Navy overlay on kitchen image */}
        {/* ================================================================ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={PHOTOS.heroKitchen}
              alt="Beautiful kitchen remodel by GP Homes and Repairs"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.4)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, rgba(27,58,92,0.85) 0%, rgba(27,58,92,0.6) 50%, rgba(27,58,92,0.4) 100%)`,
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 md:py-40">
            <Reveal>
              <div className="max-w-2xl">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
                  style={{ background: "rgba(232,134,58,0.15)", color: ORANGE, border: `1px solid rgba(232,134,58,0.3)` }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                  BuildZoom Top 7% of 222,249 TX Contractors
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
                  Plano&apos;s Most Trusted{" "}
                  <span style={{ color: ORANGE }}>Home Remodeling</span>{" "}
                  Team
                </h1>

                <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
                  Kitchen &amp; bath remodels, room additions, and full-home renovations — backed by
                  universal 5-star reviews and 15+ years of Texas craftsmanship.
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
                    Get a Free Estimate
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                      <path d="M3 10h12m-4-4l4 4-4 4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </a>
                  <a
                    href={phoneUrl}
                    onClick={() => trackConversion("hero_phone_click")}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition"
                  >
                    <PhoneIcon /> (469) 444-7777
                  </a>
                </div>

                {/* Trust stats */}
                <div className="flex gap-8 mt-12">
                  {[
                    { num: "15+", label: "Years in Business" },
                    { num: "5.0", label: "Star Rating" },
                    { num: "Top 7%", label: "TX Contractors" },
                  ].map((s, i) => (
                    <div key={i} style={{ animation: `countUp 0.6s ease-out ${400 + i * 150}ms both` }}>
                      <div className="text-2xl md:text-3xl font-black text-white">{s.num}</div>
                      <div className="text-xs text-white/60 font-medium mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* TRUST MARQUEE */}
        {/* ================================================================ */}
        <section style={{ background: NAVY, borderTop: `3px solid ${ORANGE}` }} className="py-4 overflow-hidden">
          <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mr-8">
                {[
                  "★ BuildZoom Top 7%",
                  "★ Universal 5-Star Reviews",
                  "★ Licensed & Bonded",
                  "★ 15+ Years Experience",
                  "★ Full-Spectrum Service",
                  "★ City of Plano Licensed",
                  "★ Free Estimates",
                ].map((t, j) => (
                  <span key={j} className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    {t}
                    <span style={{ color: ORANGE }}>◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* PORTFOLIO GALLERY */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Our Work</SectionTag>
              <SectionTitle text="Quality Craftsmanship," accent="Every Project" />
              <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_MID }}>
                From kitchen transformations to complete home renovations — see why Plano homeowners trust GP Homes.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { src: PHOTOS.heroKitchen, label: "Kitchen Remodel", span: true },
                { src: PHOTOS.bathroom, label: "Bathroom Renovation", span: false },
                { src: PHOTOS.flooring, label: "Flooring Installation", span: false },
                { src: PHOTOS.exterior, label: "Exterior Renovation", span: true },
                { src: PHOTOS.roomAddition, label: "Room Addition", span: false },
                { src: PHOTOS.garage, label: "Garage Conversion", span: false },
              ].map((item, i) => (
                <Reveal
                  key={i}
                  delay={i * 100}
                  className={`relative overflow-hidden rounded-xl group cursor-pointer gallery-img ${
                    item.span ? "md:col-span-2" : ""
                  }`}
                  style={{ aspectRatio: item.span ? "2/1" : "1/1" } as any}
                >
                  <img
                    src={item.src}
                    alt={`${item.label} by GP Homes and Repairs`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    style={{ background: "linear-gradient(to top, rgba(27,58,92,0.8) 0%, transparent 60%)" }}
                  >
                    <span className="text-white font-bold text-sm p-4">{item.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* REVIEW STARS */}
        {/* ================================================================ */}
        <section style={{ background: OFF_WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Reputation</SectionTag>
              <SectionTitle text="Universal 5-Star Reviews," accent="Zero Negatives" />
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { platform: "HomeAdvisor", count: "12", rating: "5.0" },
                { platform: "Networx", count: "8", rating: "5.0" },
                { platform: "BestProsInTown", count: "18", rating: "5.0" },
                { platform: "Yelp", count: "33+", rating: "4.9" },
              ].map((r, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div
                    className="card-hover rounded-xl p-6 text-center"
                    style={{
                      background: WHITE,
                      border: `1px solid ${BORDER}`,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex justify-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
                    </div>
                    <div className="text-3xl font-black mb-1" style={{ color: NAVY }}>{r.rating}</div>
                    <div className="text-xs font-semibold mb-1" style={{ color: TEXT_MID }}>
                      {r.count} reviews
                    </div>
                    <div className="text-xs font-bold" style={{ color: ORANGE }}>{r.platform}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Google Reviews gap callout */}
            <Reveal delay={500} className="mt-8">
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: WARM_BG,
                  border: `2px dashed ${ORANGE}`,
                }}
              >
                <div className="text-xl font-bold mb-2" style={{ color: NAVY }}>
                  But Google Reviews? <span style={{ color: ORANGE }}>0</span>
                </div>
                <p className="text-sm max-w-md mx-auto" style={{ color: TEXT_MID }}>
                  The #1 platform where homeowners search — and GP Homes is invisible.
                  That&apos;s the gap we close.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE GAP — Data Visualization */}
        {/* ================================================================ */}
        <section style={{ background: NAVY }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag light>The Problem</SectionTag>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight mb-5">
                World-Class Work,{" "}
                <span style={{ color: ORANGE }}>Zero Online Visibility</span>
              </h2>
              <p className="text-base max-w-xl mx-auto text-white/70">
                Your reputation exists — but only where customers aren&apos;t looking.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { stat: "1.5/10", label: "Digital Presence Score", desc: "Facebook: 23 likes, last post Oct 2024. No Instagram, no TikTok, no YouTube." },
                { stat: "0", label: "Google Reviews", desc: "The #1 trust signal for local search — and GP Homes has none." },
                { stat: "3", label: "Different Phone Numbers", desc: "NAP inconsistency across directories kills search rankings." },
                { stat: "Broken", label: "Website Contact Forms", desc: "Raw shortcodes, no address, no hours — leads can't reach you." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div
                    className="rounded-xl p-6"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="text-4xl font-black mb-2" style={{ color: ORANGE }}>{item.stat}</div>
                    <div className="text-base font-bold text-white mb-2">{item.label}</div>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMPETITOR COMPARISON */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Market Intel</SectionTag>
              <SectionTitle text="Your Competitors" accent="Show Up — You Don't" />
            </Reveal>

            <div className="space-y-5 max-w-2xl mx-auto">
              {[
                { name: "DFW Improved", reviews: 210, pct: 100 },
                { name: "Home Platinum", reviews: 98, pct: 47 },
                { name: "BRYJO Roofing", reviews: 31, pct: 15 },
                { name: "GP Homes", reviews: 0, pct: 0, highlight: true },
              ].map((c, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-36 text-right text-sm font-semibold flex-shrink-0"
                      style={{ color: c.highlight ? ORANGE : NAVY }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="flex-1 h-10 rounded-lg overflow-hidden"
                      style={{ background: OFF_WHITE, border: `1px solid ${BORDER}` }}
                    >
                      <div
                        className="h-full rounded-lg flex items-center px-3"
                        style={{
                          ["--bar-width" as any]: `${c.pct}%`,
                          width: `${c.pct}%`,
                          animation: `barGrow 1.2s ease-out ${300 + i * 200}ms both`,
                          background: c.highlight
                            ? `repeating-linear-gradient(45deg, rgba(232,134,58,0.15), rgba(232,134,58,0.15) 4px, transparent 4px, transparent 8px)`
                            : `linear-gradient(90deg, ${NAVY}, ${NAVY_LIGHT})`,
                        }}
                      >
                        {c.reviews > 0 && (
                          <span className="text-xs font-bold text-white">{c.reviews} reviews</span>
                        )}
                      </div>
                    </div>
                    {c.highlight && (
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: ORANGE }}>
                        ← You
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* YOUR STORY — Why This Matters */}
        {/* ================================================================ */}
        <section style={{ background: WARM_BG }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <Reveal>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={PHOTOS.exterior}
                    alt="GP Homes exterior renovation work"
                    className="w-full h-80 md:h-[420px] object-cover"
                    loading="lazy"
                  />
                </div>
              </Reveal>

              {/* Content */}
              <Reveal delay={200}>
                <SectionTag>Why It Matters</SectionTag>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-[1.15] mb-6" style={{ color: NAVY }}>
                  World-Class Work,{" "}
                  <span style={{ color: ORANGE }}>Quiet Feed</span>
                </h2>
                <div className="space-y-4">
                  {[
                    "You're in the top 7% of Texas contractors — but Plano homeowners can't find you online.",
                    "Your competitors with inferior work are winning leads through Google visibility alone.",
                    "Every lost kitchen lead = $15K–$50K in revenue walking to a competitor.",
                    "Spring 2026 is peak booking season in the #1 real estate market in America. Time matters.",
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-0.5 flex-shrink-0"><CheckIcon /></div>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{txt}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WEBSITE ISSUES — Quick Wins */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Quick Wins</SectionTag>
              <SectionTitle text="Your Website Is" accent="Losing You Leads" />
              <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_MID }}>
                We found critical issues preventing customers from contacting you.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "🔴", title: "Broken Contact Forms", desc: "Raw shortcode visible instead of working forms. Customers literally cannot reach you." },
                { icon: "🔴", title: "No Address or Hours", desc: "No physical address, email, or business hours on the website. Trust killer for homeowners." },
                { icon: "🟡", title: "3 Different Phone Numbers", desc: "NAP inconsistency across directories confuses Google and customers alike." },
                { icon: "🟡", title: "Broken Reviews Page", desc: "Reviews page shows raw code instead of your stellar ratings. Wasted social proof." },
                { icon: "🟡", title: "Duplicate Content", desc: "Homepage has duplicate sections that hurt SEO ranking and look unprofessional." },
                { icon: "🔴", title: "BBB Not Accredited", desc: "Listed but not verified. Easy fix that adds instant credibility for enterprise clients." },
              ].map((issue, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div
                    className="card-hover rounded-xl p-6"
                    style={{ background: OFF_WHITE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="text-2xl mb-3">{issue.icon}</div>
                    <div className="text-sm font-bold mb-2" style={{ color: NAVY }}>{issue.title}</div>
                    <p className="text-sm" style={{ color: TEXT_MID }}>{issue.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS */}
        {/* ================================================================ */}
        <section style={{ background: OFF_WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>How It Works</SectionTag>
              <SectionTitle text="From Invisible to" accent="Fully Booked" />
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Free Consultation",
                  desc: "We audit your digital presence, identify gaps, and show you exactly what your competitors are doing that you're not.",
                },
                {
                  step: "02",
                  title: "Custom Strategy",
                  desc: "Get a tailored plan: Google Maps optimization, review generation, social media launch, and NAP cleanup — all handled for you.",
                },
                {
                  step: "03",
                  title: "Watch Leads Flow",
                  desc: "Our AI-powered monitoring tracks competitors, generates reviews, and keeps your business visible 24/7. You focus on the work you love.",
                },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div
                    className="card-hover rounded-xl p-8 relative"
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="text-5xl font-black mb-4"
                      style={{ color: ORANGE, opacity: 0.15 }}
                    >
                      {s.step}
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: NAVY }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SERVICES GRID */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Services list */}
              <Reveal>
                <SectionTag>Full Spectrum</SectionTag>
                <SectionTitle text="One Team for" accent="Everything" />
                <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
                  Most contractors only do handyman or major remodels. GP Homes does both — and everything in between.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Kitchen Remodels",
                    "Bathroom Renovation",
                    "Room Additions",
                    "Garage Conversions",
                    "Flooring & Tile",
                    "Painting & Drywall",
                    "Fencing & Concrete",
                    "Electrical Work",
                    "Plumbing",
                    "Handyman Services",
                    "Home Exteriors",
                    "Custom Projects",
                  ].map((svc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-2" style={{ color: TEXT_DARK }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ORANGE }} />
                      {svc}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Image collage */}
              <Reveal delay={200}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img src={PHOTOS.bathroom} alt="Bathroom renovation" className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg mt-8">
                    <img src={PHOTOS.flooring} alt="Flooring installation" className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img src={PHOTOS.roomAddition} alt="Room addition" className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg mt-8">
                    <img src={PHOTOS.garage} alt="Garage conversion" className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* MARKET CONTEXT */}
        {/* ================================================================ */}
        <section style={{ background: NAVY }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag light>Plano Market</SectionTag>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight mb-5">
                The Opportunity Is{" "}
                <span style={{ color: ORANGE }}>Massive</span>
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: "$146K", label: "Avg Household Income" },
                { val: "$415K+", label: "Median Home Price" },
                { val: "#1", label: "US Real Estate Market" },
                { val: "1970s", label: "Housing Stock = Remodel Ready" },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div
                    className="text-center p-6 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div className="text-2xl md:text-3xl font-black mb-2" style={{ color: ORANGE }}>{m.val}</div>
                    <div className="text-xs text-white/60 font-medium">{m.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRICING */}
        {/* ================================================================ */}
        <section style={{ background: WHITE }} className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center mb-14">
              <SectionTag>Pricing</SectionTag>
              <SectionTitle text="Grow Your Online Presence" accent="Starting at $297/mo" />
              <p className="text-base max-w-xl mx-auto" style={{ color: TEXT_MID }}>
                Everything you need to dominate Plano&apos;s local search — managed for you.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: "Starter",
                  price: "$297",
                  desc: "Essential monitoring",
                  features: ["Weekly competitor reports", "Review monitoring", "WhatsApp alerts", "Monthly performance snapshot"],
                  action: "pricing_starter_click",
                },
                {
                  tier: "Growth",
                  price: "$497",
                  desc: "Full visibility engine",
                  features: ["Daily monitoring & alerts", "AI review responses", "Full analytics dashboard", "Social media content calendar", "NAP cleanup & management"],
                  popular: true,
                  action: "pricing_growth_click",
                },
                {
                  tier: "Premium",
                  price: "$797",
                  desc: "Done-for-you domination",
                  features: ["Everything in Growth", "GBP post automation", "Bi-weekly strategy calls", "Priority support", "Competitor ad monitoring"],
                  action: "pricing_premium_click",
                },
              ].map((p, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div
                    className="card-hover rounded-xl p-8 relative"
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
                        Most Popular
                      </div>
                    )}
                    <div className="text-sm font-bold mb-1" style={{ color: p.popular ? ORANGE : TEXT_LIGHT }}>
                      {p.tier}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: p.popular ? WHITE : NAVY }}>{p.price}</span>
                      <span className="text-sm" style={{ color: p.popular ? "rgba(255,255,255,0.5)" : TEXT_LIGHT }}>/mo</span>
                    </div>
                    <p className="text-sm mb-6" style={{ color: p.popular ? "rgba(255,255,255,0.6)" : TEXT_MID }}>
                      {p.desc}
                    </p>
                    <ul className="space-y-3 mb-8">
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
                      className="cta-btn block text-center w-full py-3 rounded-lg font-bold text-sm"
                      style={{
                        background: p.popular ? ORANGE : "transparent",
                        color: p.popular ? WHITE : NAVY,
                        border: p.popular ? "none" : `2px solid ${NAVY}`,
                      }}
                    >
                      Get Started
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* ROI */}
        {/* ================================================================ */}
        <section style={{ background: WARM_BG }} className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <SectionTag>ROI</SectionTag>
              <SectionTitle text="One Kitchen Lead Pays for" accent="a Full Year" />
              <div
                className="rounded-xl p-8 mt-8"
                style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
              >
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: NAVY }}>$297</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Monthly Investment</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: ORANGE }}>$15K–$50K</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Per Kitchen Lead</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-1" style={{ color: "#22C55E" }}>50x–168x</div>
                    <div className="text-xs" style={{ color: TEXT_LIGHT }}>Return on Investment</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA */}
        {/* ================================================================ */}
        <section
          className="py-20 md:py-28 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
          }}
        >
          {/* Background image subtle overlay */}
          <div className="absolute inset-0 opacity-10">
            <img src={PHOTOS.heroKitchen} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                Stop Losing Leads to{" "}
                <span style={{ color: ORANGE }}>Less Qualified Competitors</span>
              </h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                Spring is peak season. Your competitors are already getting the calls. Let&apos;s change that.
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
                  Get Your Free Audit
                </a>
                <a
                  href={phoneUrl}
                  onClick={() => trackConversion("final_cta_phone_click")}
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition"
                >
                  <PhoneIcon /> (469) 444-7777
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <footer style={{ background: "#0F172A" }} className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-white text-sm"
                    style={{ background: NAVY }}
                  >
                    GP
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">GP Homes &amp; Repairs</div>
                    <div className="text-xs text-white/40">Since 2010 — Plano, TX</div>
                  </div>
                </div>
                <p className="text-xs text-white/30">
                  3624 Marwick Drive, Plano, TX 75075 &nbsp;|&nbsp; (469) 444-7777
                </p>
              </div>
              <div className="text-xs text-white/20">
                &copy; {new Date().getFullYear()} GP Homes and Repairs. All rights reserved.
              </div>
            </div>
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
