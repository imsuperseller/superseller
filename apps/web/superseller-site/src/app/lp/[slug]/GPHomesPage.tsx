"use client";

import { useState, useEffect, useRef } from "react";
import type { LandingPage, Brand } from "@prisma/client";

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
const ORANGE = "#E8863A";
const ORANGE_DIM = "rgba(232,134,58,0.15)";
const BG = "#0e1225";
const BG_CARD = "#161a33";
const DARK = "#0a0c1a";

// ---------------------------------------------------------------------------
// Reveal wrapper (IntersectionObserver + CSS transitions)
// ---------------------------------------------------------------------------
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Tag (pill badge)
// ---------------------------------------------------------------------------
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-8 rounded-sm"
      style={{ color: ORANGE, border: `1px solid ${ORANGE_DIM}` }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section Title (two-tone)
// ---------------------------------------------------------------------------
function SectionTitle({ white, orange }: { white: string; orange: string }) {
  return (
    <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-6 max-w-2xl">
      {white}{" "}
      <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-clip-text text-transparent">
        {orange}
      </span>
    </h2>
  );
}

// ---------------------------------------------------------------------------
// WhatsApp Icon
// ---------------------------------------------------------------------------
function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
function HammerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15L22 10.64" />
      <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function XCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={ORANGE} stroke="none">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Geometric Background Pattern
// ---------------------------------------------------------------------------
function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Floating shapes */}
      <div
        className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full opacity-[0.04]"
        style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)` }}
      />
      <div
        className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full opacity-[0.03]"
        style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)` }}
      />
      {/* Diagonal accent lines */}
      <svg className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]" viewBox="0 0 600 600">
        <line x1="0" y1="0" x2="600" y2="600" stroke={ORANGE} strokeWidth="1" />
        <line x1="100" y1="0" x2="600" y2="500" stroke={ORANGE} strokeWidth="0.5" />
        <line x1="200" y1="0" x2="600" y2="400" stroke={ORANGE} strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function GPHomesPage({ page }: { page: LandingPage & { brand: Brand | null } }) {
  const [scrolled, setScrolled] = useState(false);

  const WA_MSG = encodeURIComponent(
    "Hi! I just saw the business intelligence report SuperSeller built for GP Homes — I'd like to learn more."
  );
  const WA_LINK = `https://wa.me/${page.whatsappNumber}?text=${WA_MSG}`;

  // Scroll listener for sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Analytics
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
    }).catch(() => {});
  }, [page.slug]);

  function trackConversion(eventType: string) {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, type: "conversion", eventType }),
    }).catch(() => {});
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
      />
      <div
        className="min-h-screen antialiased overflow-x-hidden"
        style={{ fontFamily: "'Inter', sans-serif", background: BG, color: "#f5f5f5" }}
      >
        {/* ================================================================ */}
        {/* STICKY HEADER                                                     */}
        {/* ================================================================ */}
        <header
          className="fixed top-0 left-0 w-full z-50 flex items-center justify-between transition-all duration-400"
          style={{
            padding: scrolled ? "1rem 4%" : "1.5rem 4%",
            background: scrolled ? "rgba(14,18,37,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(18px)" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold text-base sm:text-lg tracking-[0.08em] uppercase whitespace-nowrap"
              style={{ color: ORANGE }}
            >
              GP Homes
            </span>
            <span className="hidden sm:inline text-white/40 text-sm mx-1">&times;</span>
            <span className="hidden sm:inline font-bold text-sm tracking-[0.1em] uppercase text-white/80">
              SuperSeller
            </span>
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] sm:text-xs font-bold tracking-[0.1em] uppercase px-3 sm:px-6 py-2 sm:py-3 rounded-sm transition-all duration-300 hover:text-[#0a0c1a] whitespace-nowrap"
            style={{ border: `1.5px solid ${ORANGE}`, color: ORANGE }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ORANGE;
              e.currentTarget.style.color = DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = ORANGE;
            }}
            onClick={() => trackConversion("header_whatsapp_click")}
          >
            Let&rsquo;s Talk
          </a>
        </header>

        {/* ================================================================ */}
        {/* HERO                                                              */}
        {/* ================================================================ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background gradient + geometric */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 20% 30%, rgba(232,134,58,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(232,134,58,0.04) 0%, transparent 50%), linear-gradient(180deg, ${DARK} 0%, ${BG} 60%, ${BG} 100%)`,
              }}
            />
            <GeometricPattern />
          </div>

          {/* Content — CSS animations for hero (more reliable than framer on initial load) */}
          <div className="relative z-10 px-[6%] max-w-[900px]">
            <div className="animate-[heroFadeUp_0.7s_ease-out_0.1s_both]">
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 rounded-sm mb-8"
                style={{ color: ORANGE, border: `1px solid ${ORANGE_DIM}` }}
              >
                Built for Nir, Ron &amp; the GP Homes Team
              </span>
            </div>
            <h1
              className="text-[clamp(2.4rem,5.5vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-6 animate-[heroFadeUp_0.7s_ease-out_0.25s_both]"
            >
              Top 7% in Texas. Invisible Online.
              <br />
              <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-[length:200%_auto] bg-clip-text text-transparent">
                We&rsquo;re Here to Fix That.
              </span>
            </h1>
            <p
              className="text-base md:text-lg font-light leading-relaxed max-w-[600px] mb-10 text-[#9a9cb8] animate-[heroFadeUp_0.7s_ease-out_0.4s_both]"
            >
              We analyzed your business, your competitors, and your market before this
              conversation started. Scroll down to see what we found.
            </p>
            <div className="flex gap-4 flex-wrap animate-[heroFadeUp_0.7s_ease-out_0.55s_both]">
              <a
                href="#the-gap"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #f0a860 50%, ${ORANGE} 100%)`,
                  color: DARK,
                  boxShadow: `0 4px 15px rgba(232,134,58,0.25)`,
                }}
              >
                See What We Found <span>&darr;</span>
              </a>
              <a
                href="#what-we-found"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 border border-white/12 backdrop-blur-sm bg-white/[0.03] hover:border-[#E8863A]/30 hover:bg-[#E8863A]/5 hover:-translate-y-px"
              >
                View Your Report
              </a>
            </div>
          </div>
          <style>{`@keyframes heroFadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50">
            <span className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ================================================================ */}
        {/* MARQUEE                                                           */}
        {/* ================================================================ */}
        <div className="py-5 overflow-hidden border-y border-white/5" style={{ background: DARK }}>
          <div className="flex gap-12 animate-[marquee_35s_linear_infinite] whitespace-nowrap">
            {[
              "Business Intelligence",
              "Competitor Analysis",
              "Review Strategy",
              "Google Maps",
              "Content Strategy",
              "Digital Presence Audit",
              "Market Research",
              "Business Intelligence",
              "Competitor Analysis",
              "Review Strategy",
              "Google Maps",
              "Content Strategy",
              "Digital Presence Audit",
              "Market Research",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-xs font-semibold tracking-[0.15em] uppercase text-white/50"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} />
                {item}
              </div>
            ))}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ================================================================ */}
        {/* THE GAP — Data visualization                                      */}
        {/* ================================================================ */}
        <section id="the-gap" className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>The Problem</SectionTag>
            </Reveal>
            <Reveal>
              <SectionTitle white="5-Star Quality." orange="1.5/10 Visibility." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Your work speaks for itself — universal 5-star reviews, BuildZoom&rsquo;s top 7% in
                Texas. But online, you&rsquo;re practically invisible. The gap between the quality of
                your work and your digital presence is costing you projects every single day.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    number: "1.5/10",
                    label: "Digital Presence Score",
                    sub: "vs. 7+ for top competitors",
                  },
                  {
                    number: "23",
                    label: "Facebook Likes",
                    sub: "vs. 500+ for competitors your size",
                  },
                  {
                    number: "0",
                    label: "Google Reviews",
                    sub: "despite 5-star ratings everywhere else",
                  },
                  {
                    number: "Oct 2024",
                    label: "Last Social Post",
                    sub: "5+ months of silence online",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-6 border border-white/8 text-center backdrop-blur-sm transition-all duration-500 ease-out"
                    style={{ background: `${BG_CARD}dd`, transitionDelay: `${i * 120}ms` }}
                  >
                    <div
                      className="text-2xl md:text-3xl font-black mb-2"
                      style={{ color: ORANGE }}
                    >
                      {stat.number}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">
                      {stat.label}
                    </div>
                    <div className="text-[0.65rem] text-white/40 leading-snug">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT WE FOUND — Key intelligence cards                            */}
        {/* ================================================================ */}
        <section
          id="what-we-found"
          className="py-24 px-[4%] relative overflow-hidden"
          style={{ background: DARK }}
        >
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Your Market</SectionTag>
            </Reveal>
            <Reveal>
              <SectionTitle white="We Researched Your Landscape." orange="Here's What We See." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                Before building anything, we studied your market, your competitors, and your
                positioning. Here are the three things you need to know.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: "map",
                    title: "Market Opportunity",
                    desc: "Plano, TX — $146K average household income, homes valued $415K\u2013$790K, mostly 1970s\u201380s housing stock primed for remodeling. DFW is the #1 real estate market in the US right now. The demand for quality contractors has never been higher.",
                  },
                  {
                    icon: "search",
                    title: "Your Competition",
                    desc: "9,706 contractors operating in Plano alone. Your top competitors \u2014 DFW Improved, BRYJO \u2014 dominate through online visibility, not better work. They have 100\u2013210+ Google reviews each. Their websites rank. Their social media is active. That\u2019s the difference.",
                  },
                  {
                    icon: "shield",
                    title: "Your Advantage",
                    desc: "BuildZoom ranks you in the top 7% of 222,249 Texas contractors. You have universal 5-star reviews across every platform. Full-spectrum service from handyman repairs through major remodels is rare. Zero negative reviews found anywhere. The foundation is exceptional.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-7 rounded-xl border border-white/8 transition-all duration-500 ease-out hover:border-white/15 hover:-translate-y-1 backdrop-blur-sm"
                    style={{ background: `${BG_CARD}dd`, transitionDelay: `${i * 120}ms` }}
                  >
                    <div className="mb-4">
                      {item.icon === "map" ? (
                        <MapPinIcon />
                      ) : item.icon === "search" ? (
                        <SearchIcon />
                      ) : (
                        <ShieldIcon />
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[#9a9cb8]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WEBSITE ISSUES — What's broken                                    */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Quick Wins</SectionTag>
            </Reveal>
            <Reveal>
              <SectionTitle white="Your Website Has" orange="Easy Fixes." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                We went through your current online presence and identified specific issues
                that are costing you credibility and leads right now. Every one of these is fixable.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    issue: "Broken reviews page",
                    detail: "Raw WordPress shortcode displaying instead of actual reviews",
                  },
                  {
                    issue: "Contact forms not working",
                    detail: "Potential customers can\u2019t reach you through your own website",
                  },
                  {
                    issue: "No address, email, or business hours",
                    detail: "Essential trust signals missing from your site entirely",
                  },
                  {
                    issue: "Three different phone numbers across directories",
                    detail: "NAP inconsistency hurts Google ranking and confuses customers",
                  },
                  {
                    issue: "Copyright still says 2024",
                    detail: "Signals an unmaintained, potentially inactive business",
                  },
                  {
                    issue: "BBB listed but not accredited",
                    detail: "An unfinished credibility signal that raises questions instead of trust",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-6 py-5 rounded-xl border border-white/8 transition-all duration-500 ease-out hover:border-red-500/20 backdrop-blur-sm"
                    style={{ background: `${BG_CARD}dd`, transitionDelay: `${i * 120}ms` }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <XCircleIcon />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white/90 mb-1">{item.issue}</h4>
                      <p className="text-xs text-[#9a9cb8] leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT WE DO — 3-step "How it works"                                */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>What Happens Next</SectionTag>
            </Reveal>
            <Reveal>
              <SectionTitle white="You Say Yes." orange="We Handle Everything." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-16 text-[#9a9cb8]">
                Everything you&rsquo;ve seen on this page was researched before we even spoke.
                Here&rsquo;s what happens when you&rsquo;re ready to start.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    num: "01",
                    title: "Quick Call",
                    desc: "15 minutes. We walk through our findings, answer your questions, and customize the strategy to your goals and budget.",
                    icon: <PhoneIcon />,
                  },
                  {
                    num: "02",
                    title: "We Build Your Engine",
                    desc: "Fix website issues, set up Google review collection, launch your social media presence, and optimize your Google Business Profile \u2014 all handled by us.",
                    icon: <SettingsIcon />,
                  },
                  {
                    num: "03",
                    title: "Watch It Work",
                    desc: "Competitor monitoring, review alerts, monthly reports \u2014 all automated, all delivered straight to your WhatsApp. You focus on the work. We handle the rest.",
                    icon: <EyeIcon />,
                  },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-xl border border-white/8 transition-all duration-500 ease-out hover:border-[#E8863A]/20 hover:-translate-y-1 group backdrop-blur-sm"
                    style={{ background: `${BG_CARD}dd`, transitionDelay: `${i * 120}ms` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="text-5xl font-black tracking-tight transition-colors duration-300 group-hover:text-[#E8863A]"
                        style={{ color: "rgba(255,255,255,0.08)" }}
                      >
                        {step.num}
                      </div>
                      <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-[#9a9cb8]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRICING — 3 tiers                                                 */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto text-center">
            <Reveal>
              <SectionTag>Investment</SectionTag>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-4 max-w-xl mx-auto">
                Pick Your{" "}
                <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-clip-text text-transparent">
                  Growth Plan
                </span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-14 max-w-lg mx-auto">
                No setup fees. No contracts. Cancel anytime.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  price: "$297",
                  desc: "Stay informed on your market with automated intelligence.",
                  features: [
                    "Weekly competitor report",
                    "Review monitoring across platforms",
                    "WhatsApp alerts for new reviews",
                    "Monthly market summary",
                    "NAP consistency audit",
                  ],
                  highlighted: false,
                },
                {
                  name: "Growth",
                  price: "$497",
                  desc: "The full engine \u2014 monitoring, optimization, and active management.",
                  features: [
                    "Daily competitor monitoring",
                    "AI-powered review responses",
                    "Full analytics dashboard",
                    "Google Maps optimization",
                    "Social media content calendar",
                    "Google Business Profile management",
                    "WhatsApp approval workflow",
                    "Monthly performance report",
                  ],
                  highlighted: true,
                },
                {
                  name: "Premium",
                  price: "$797",
                  desc: "Everything in Growth plus hands-on strategy and priority support.",
                  features: [
                    "Everything in Growth",
                    "GBP post automation",
                    "Bi-weekly strategy calls",
                    "Priority support",
                    "Website issue monitoring",
                    "Quarterly competitive deep-dive",
                  ],
                  highlighted: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative p-8 rounded-xl border text-left transition-all duration-500 ease-out hover:-translate-y-1 backdrop-blur-sm ${
                    plan.highlighted ? "border-[#E8863A]/40" : "border-white/8"
                  }`}
                  style={{
                    background: plan.highlighted
                      ? `linear-gradient(135deg, ${BG_CARD} 0%, rgba(232,134,58,0.08) 100%)`
                      : `${BG_CARD}dd`,
                    transitionDelay: `${i * 120}ms`,
                  }}
                >
                  {plan.highlighted && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.2em] uppercase px-4 py-1 rounded-full"
                      style={{ background: ORANGE, color: DARK }}
                    >
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span
                      className="text-4xl font-black"
                      style={{ color: ORANGE }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>
                  <p className="text-sm text-[#9a9cb8] mb-6">{plan.desc}</p>
                  <div className="space-y-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2.5">
                        <div className="flex-shrink-0">
                          <CheckIcon />
                        </div>
                        <span className="text-sm text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-8 text-center py-3 rounded-full font-bold text-xs tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5"
                    style={
                      plan.highlighted
                        ? {
                            background: `linear-gradient(135deg, ${ORANGE} 0%, #f0a860 50%, ${ORANGE} 100%)`,
                            color: DARK,
                          }
                        : { border: `1.5px solid ${ORANGE}`, color: ORANGE }
                    }
                    onClick={() => trackConversion(`pricing_${plan.name.toLowerCase()}_click`)}
                  >
                    Get Started
                  </a>
                </div>
              ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA                                                         */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <Reveal>
                <SectionTag>Ready?</SectionTag>
              </Reveal>
              <Reveal>
                <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-6 max-w-2xl mx-auto">
                  Your Competitors Are Online.{" "}
                  <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-clip-text text-transparent">
                    You Should Be Too.
                  </span>
                </h2>
              </Reveal>
              <Reveal>
                <p className="text-base font-light leading-relaxed text-[#9a9cb8] max-w-2xl mx-auto mb-10">
                  Spring is peak booking season in DFW. Every day without an online presence
                  is a $15K&ndash;$50K kitchen remodel that goes to someone else. DFW Improved
                  and BRYJO aren&rsquo;t winning because they do better work &mdash; they&rsquo;re
                  winning because they show up when homeowners search.
                </p>
              </Reveal>
              <Reveal>
                <div
                  className="rounded-xl p-10 border text-center"
                  style={{
                    borderColor: `${ORANGE}66`,
                    background: `linear-gradient(135deg, rgba(232,134,58,0.05), rgba(232,134,58,0.02))`,
                  }}
                >
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE} 0%, #f0a860 50%, ${ORANGE} 100%)`,
                      color: DARK,
                      boxShadow: `0 4px 20px rgba(232,134,58,0.3)`,
                    }}
                    onClick={() => trackConversion("final_cta_whatsapp_click")}
                  >
                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.325-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                    </svg>
                    Let&rsquo;s Talk on WhatsApp
                  </a>
                  <p className="text-xs text-white/30 mt-6 max-w-lg mx-auto">
                    Join 222,249 Texas contractors who know &mdash; the best work wins when
                    people can find it.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER                                                            */}
        {/* ================================================================ */}
        <footer
          className="py-8 px-[4%] text-center border-t border-white/5"
          style={{ background: DARK }}
        >
          <p className="font-bold text-sm tracking-[0.1em] uppercase mb-1" style={{ color: ORANGE }}>
            GP Homes and Repairs
          </p>
          <span className="text-xs text-white/30 mx-1">&times;</span>
          <span className="text-xs font-semibold tracking-wide uppercase text-white/50">
            SuperSeller AI
          </span>
          <p className="text-xs text-white/40 mt-3">(469) 444-7777</p>
          <p className="text-xs text-white/20 mt-4">
            Powered by{" "}
            <span className="text-white/40">SuperSeller AI</span>
          </p>
        </footer>

        {/* ================================================================ */}
        {/* WHATSAPP FAB                                                      */}
        {/* ================================================================ */}
        {page.whatsappNumber && (
          <a
            href={`https://wa.me/${page.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            onClick={() => trackConversion("whatsapp_fab_click")}
          >
            <WhatsAppIcon />
          </a>
        )}
      </div>
    </>
  );
}
