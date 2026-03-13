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
// Reveal wrapper — pure CSS animation, SSR-safe
// ---------------------------------------------------------------------------
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={className || ""}
      style={{ animation: `revealUp 0.7s ease-out ${delay}ms both` }}
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

function StarIcon({ size = 16, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? ORANGE : "none"} stroke={ORANGE} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Geometric Background Pattern
// ---------------------------------------------------------------------------
function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div
        className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full opacity-[0.04]"
        style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)` }}
      />
      <div
        className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full opacity-[0.03]"
        style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)` }}
      />
      <svg className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]" viewBox="0 0 600 600">
        <line x1="0" y1="0" x2="600" y2="600" stroke={ORANGE} strokeWidth="1" />
        <line x1="100" y1="0" x2="600" y2="500" stroke={ORANGE} strokeWidth="0.5" />
        <line x1="200" y1="0" x2="600" y2="400" stroke={ORANGE} strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glassmorphism Card
// ---------------------------------------------------------------------------
function GlassCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] backdrop-blur-xl ${className}`}
      style={{
        background: "rgba(22, 26, 51, 0.6)",
        boxShadow: glow
          ? `0 0 30px rgba(232,134,58,0.08), inset 0 1px 0 rgba(255,255,255,0.05)`
          : `inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {children}
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 20% 30%, rgba(232,134,58,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(232,134,58,0.04) 0%, transparent 50%), linear-gradient(180deg, ${DARK} 0%, ${BG} 60%, ${BG} 100%)`,
              }}
            />
            <GeometricPattern />
          </div>

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
                href="#reputation"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 border border-white/12 backdrop-blur-sm bg-white/[0.03] hover:border-[#E8863A]/30 hover:bg-[#E8863A]/5 hover:-translate-y-px"
              >
                Your Reputation
              </a>
            </div>
          </div>
          <style>{`
            @keyframes heroFadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes revealUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(232,134,58,0.15); } 50% { box-shadow: 0 0 40px rgba(232,134,58,0.3); } }
            @keyframes barGrow { from { width: 0%; } to { width: var(--bar-width); } }
          `}</style>

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
        {/* REPUTATION — 5-Star Review Showcase (NEW)                         */}
        {/* ================================================================ */}
        <section id="reputation" className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Your Reputation</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="Universal 5-Star Reviews." orange="Across Every Platform." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Zero negative reviews. Anywhere. That&rsquo;s not common — it&rsquo;s exceptional. But without
                Google reviews, the platform that matters most is the one where you&rsquo;re invisible.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { platform: "HomeAdvisor", reviews: "12", rating: "5.0" },
                  { platform: "Networx", reviews: "8", rating: "5.0" },
                  { platform: "BestProsInTown", reviews: "18", rating: "5.0" },
                  { platform: "Yelp", reviews: "33+", rating: "5.0" },
                ].map((p, i) => (
                  <GlassCard key={i} className="p-6 text-center" glow>
                    <div className="flex justify-center gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} size={14} />
                      ))}
                    </div>
                    <div className="text-2xl font-black mb-1" style={{ color: ORANGE }}>
                      {p.rating}
                    </div>
                    <div className="text-xs font-bold text-white/80 mb-1">{p.platform}</div>
                    <div className="text-[0.65rem] text-white/40">{p.reviews} reviews</div>
                  </GlassCard>
                ))}
              </div>
            </Reveal>

            {/* Google — the gap */}
            <Reveal delay={400}>
              <GlassCard className="p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06]"
                  style={{ background: `radial-gradient(circle, #ef4444 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
                />
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      Google Reviews: <span className="text-[#ef4444]">0</span>
                    </h3>
                    <p className="text-sm text-[#9a9cb8] leading-relaxed">
                      Google is where 46% of local searches happen. Your competitors have 30–210+ Google
                      reviews. Despite your perfect ratings on every other platform, you&rsquo;re invisible
                      where it matters most. Every week without Google reviews is a week you&rsquo;re losing
                      kitchen remodel leads worth $15K–$50K each.
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-center md:text-right">
                    <div className="text-4xl font-black text-[#ef4444]">0</div>
                    <div className="text-[0.65rem] text-white/40 uppercase tracking-wider">vs. 210+ for top competitor</div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE GAP — Data visualization                                      */}
        {/* ================================================================ */}
        <section id="the-gap" className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>The Problem</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="5-Star Quality." orange="1.5/10 Visibility." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Your work speaks for itself — universal 5-star reviews, BuildZoom&rsquo;s top 7% in
                Texas. But online, you&rsquo;re practically invisible. The gap between the quality of
                your work and your digital presence is costing you projects every single day.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { number: "1.5/10", label: "Digital Presence Score", sub: "vs. 7+ for top competitors" },
                  { number: "23", label: "Facebook Likes", sub: "vs. 500+ for competitors your size" },
                  { number: "0", label: "Google Reviews", sub: "despite 5-star ratings everywhere else" },
                  { number: "Oct 2024", label: "Last Social Post", sub: "5+ months of silence online" },
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-6 text-center">
                    <div
                      className="text-2xl md:text-3xl font-black mb-2"
                      style={{ color: ORANGE, animation: `countUp 0.5s ease-out ${300 + i * 150}ms both` }}
                    >
                      {stat.number}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">
                      {stat.label}
                    </div>
                    <div className="text-[0.65rem] text-white/40 leading-snug">{stat.sub}</div>
                  </GlassCard>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMPETITOR LANDSCAPE — Visual comparison (NEW)                     */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Competitive Intelligence</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="You vs. Your Competitors." orange="The Online Gap." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Your top competitors don&rsquo;t do better work — they just show up online. Here&rsquo;s
                how you compare on the metrics that drive leads in Plano.
              </p>
            </Reveal>

            {/* Google Reviews comparison */}
            <Reveal delay={300}>
              <GlassCard className="p-8 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-6">Google Reviews</h3>
                <div className="space-y-5">
                  {[
                    { name: "DFW Improved", reviews: 210, pct: 100, color: "#4ecdc4" },
                    { name: "Home Platinum", reviews: 98, pct: 47, color: "#4ecdc4" },
                    { name: "BRYJO Roofing", reviews: 31, pct: 15, color: "#4ecdc4" },
                    { name: "GP Homes", reviews: 0, pct: 2, color: "#ef4444", you: true },
                  ].map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className={`text-sm font-semibold ${c.you ? "text-white" : "text-white/70"}`}>
                          {c.name} {c.you && <span className="text-[0.6rem] uppercase tracking-wider ml-2 px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>You</span>}
                        </span>
                        <span className="text-sm font-bold" style={{ color: c.color }}>{c.reviews}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.pct}%`,
                            background: c.you
                              ? "linear-gradient(90deg, #ef4444, #ef444480)"
                              : `linear-gradient(90deg, ${c.color}, ${c.color}80)`,
                            animation: `barGrow 1s ease-out ${400 + i * 200}ms both`,
                            ["--bar-width" as string]: `${c.pct}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            {/* Side-by-side stat cards */}
            <Reveal delay={400}>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Online Visibility",
                    you: "1.5/10",
                    them: "7+/10",
                    insight: "Top competitors dominate Google Maps local pack — 46% of all local search clicks",
                  },
                  {
                    label: "Social Followers",
                    you: "23",
                    them: "500+",
                    insight: "Before/after content on social media is the #1 lead generator for remodeling contractors",
                  },
                  {
                    label: "Monthly Leads from Digital",
                    you: "~0",
                    them: "15-30+",
                    insight: "Competitors invest in visibility, not quality — yet they capture the majority of leads",
                  },
                ].map((c, i) => (
                  <GlassCard key={i} className="p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">{c.label}</div>
                    <div className="flex items-baseline gap-3 mb-4">
                      <div>
                        <div className="text-2xl font-black text-[#ef4444]">{c.you}</div>
                        <div className="text-[0.6rem] uppercase tracking-wider text-white/30">You</div>
                      </div>
                      <div className="text-white/20 text-lg">vs</div>
                      <div>
                        <div className="text-2xl font-black" style={{ color: "#4ecdc4" }}>{c.them}</div>
                        <div className="text-[0.6rem] uppercase tracking-wider text-white/30">Competitors</div>
                      </div>
                    </div>
                    <p className="text-[0.75rem] text-[#9a9cb8] leading-relaxed">{c.insight}</p>
                  </GlassCard>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* YOUR STORY — Why this matters (NEW)                               */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Your Story</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="15 Years. Top 7%. Zero Presence." orange="That's the Gap We Close." />
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: <HammerIcon />,
                  title: "World-Class Work, Quiet Feed",
                  text: "Since 2010, GP Homes has earned universal 5-star reviews and BuildZoom's top 7% ranking. But a Facebook page with 23 likes and zero Instagram means your best work stays invisible to the homeowners searching right now.",
                },
                {
                  icon: <UsersIcon />,
                  title: "Your Competitors Show Up — You Don't",
                  text: "DFW Improved has 210+ Google reviews. BRYJO won NARI awards and posts weekly. They don't do better work — they just show up. In 2026, showing up online is the job interview before the estimate.",
                },
                {
                  icon: <DollarIcon />,
                  title: "$15K–$50K Per Lost Lead",
                  text: "Every kitchen remodel in Plano is a $15K–$50K project. When a homeowner searches 'kitchen remodeling Plano TX,' they find your competitors first. Every day without online presence is revenue walking to someone else.",
                },
              ].map((card, i) => (
                <Reveal key={i} delay={200 + i * 150}>
                  <GlassCard className="p-8 h-full" glow>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: ORANGE_DIM }}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                    <p className="text-sm text-[#9a9cb8] leading-relaxed">{card.text}</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT WE FOUND — Market intelligence cards                         */}
        {/* ================================================================ */}
        <section
          id="what-we-found"
          className="py-24 px-[4%] relative overflow-hidden"
          style={{ background: BG }}
        >
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Your Market</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="We Researched Your Landscape." orange="Here's What We See." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                Before building anything, we studied your market, your competitors, and your
                positioning. Here are the three things you need to know.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <MapPinIcon />,
                  title: "Market Opportunity",
                  text: "Plano, TX — $146K average household income, homes valued $415K–$790K, mostly 1970s–80s housing stock. These homes need updates. DFW is the #1 real estate market in the US, and spring 2026 is peak booking season.",
                },
                {
                  icon: <SearchIcon />,
                  title: "Your Competition",
                  text: "9,706 contractors operating in Plano alone. Your top competitors — DFW Improved, BRYJO — dominate through online visibility, not better work quality. They win the trust battle before a single phone call.",
                },
                {
                  icon: <ShieldIcon />,
                  title: "Your Advantage",
                  text: "BuildZoom ranks you in the top 7% of 222,249 Texas contractors. You have universal 5-star reviews across every platform. Full-spectrum service (handyman to major remodel) is rare — most competitors only do one.",
                },
              ].map((card, i) => (
                <Reveal key={i} delay={300 + i * 150}>
                  <GlassCard className="p-8 h-full" glow>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: ORANGE_DIM }}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                    <p className="text-sm text-[#9a9cb8] leading-relaxed">{card.text}</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WEBSITE ISSUES                                                    */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Quick Wins</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="Your Website Has" orange="Easy Fixes." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                We went through your current online presence and identified specific issues that
                are costing you credibility and leads right now. Every one of these is fixable.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Broken reviews page", desc: "Raw WordPress shortcode displaying instead of actual reviews" },
                  { title: "Contact forms not working", desc: "Potential customers can't reach you through your own website" },
                  { title: "No address, email, or business hours", desc: "Essential trust signals missing from your site entirely" },
                  { title: "Three different phone numbers across directories", desc: "NAP inconsistency hurts Google ranking and confuses customers" },
                  { title: "Copyright still says 2024", desc: "Signals an unmaintained, potentially inactive business" },
                  { title: "BBB listed but not accredited", desc: "An unfinished credibility signal that raises questions instead of trust" },
                ].map((issue, i) => (
                  <GlassCard key={i} className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <XCircleIcon />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">{issue.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{issue.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS                                                      */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>What Happens Next</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="You Say Yes." orange="We Handle Everything." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Everything you&rsquo;ve seen on this page was researched before we even spoke. Here&rsquo;s
                what happens when you give us the green light.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <PhoneIcon />,
                  title: "Quick Call",
                  text: "15 minutes. We walk through our findings, answer your questions, and customize the strategy to your goals and budget.",
                },
                {
                  step: "02",
                  icon: <SettingsIcon />,
                  title: "We Build Your Engine",
                  text: "Fix website issues, set up Google review collection, launch your social media presence, and optimize your Google Business Profile.",
                },
                {
                  step: "03",
                  icon: <EyeIcon />,
                  title: "Watch It Work",
                  text: "Competitor monitoring, review alerts, monthly reports — all automated, all delivered straight to your WhatsApp.",
                },
              ].map((s, i) => (
                <Reveal key={i} delay={300 + i * 150}>
                  <div className="relative">
                    <span
                      className="absolute -top-4 -left-2 text-[5rem] font-black leading-none pointer-events-none select-none"
                      style={{ color: `${ORANGE}08` }}
                    >
                      {s.step}
                    </span>
                    <GlassCard className="p-8 relative">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: ORANGE_DIM }}>
                        {s.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                      <p className="text-sm text-[#9a9cb8] leading-relaxed">{s.text}</p>
                    </GlassCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SERVICES — What they actually do (NEW)                            */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>Full-Spectrum Contractor</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="One Team." orange="Every Project." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                Most competitors only do remodels or only do handyman work. GP Homes does it all — and
                that&rsquo;s a competitive advantage most Plano homeowners don&rsquo;t know about yet.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Kitchen Remodeling",
                  "Bathroom Remodeling",
                  "Room Additions",
                  "Garage Conversions",
                  "Flooring",
                  "Painting",
                  "Electrical",
                  "Plumbing",
                  "Drywall",
                  "Fencing",
                  "Concrete Work",
                  "Handyman Services",
                ].map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-white/[0.06] text-sm text-white/70 backdrop-blur-sm"
                    style={{ background: "rgba(22, 26, 51, 0.4)" }}
                  >
                    <CheckIcon size={12} />
                    {service}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRICING                                                           */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto text-center">
            <Reveal>
              <SectionTag>Investment</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-4">
                Pick Your{" "}
                <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-clip-text text-transparent">
                  Growth Plan
                </span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-sm text-white/50 mb-14">
                No setup fees. No contracts. Cancel anytime.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                {/* Starter */}
                <GlassCard className="p-8">
                  <h3 className="text-lg font-bold mb-1">Starter</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black" style={{ color: ORANGE }}>$297</span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>
                  <p className="text-sm text-[#9a9cb8] mb-6">
                    Stay informed on your market with automated intelligence.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Weekly competitor report",
                      "Review monitoring across platforms",
                      "WhatsApp alerts for new reviews",
                      "Monthly market summary",
                      "NAP consistency audit",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                        <CheckIcon /> {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 text-xs font-bold tracking-[0.1em] uppercase rounded-full border transition-all duration-300 hover:-translate-y-0.5"
                    style={{ borderColor: ORANGE, color: ORANGE }}
                    onClick={() => trackConversion("pricing_starter_click")}
                  >
                    Get Started
                  </a>
                </GlassCard>

                {/* Growth — featured */}
                <div className="relative">
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.2em] uppercase px-4 py-1 rounded-full z-10"
                    style={{ background: ORANGE, color: DARK }}
                  >
                    Most Popular
                  </div>
                  <GlassCard className="p-8 ring-1 ring-[#E8863A]/30" glow>
                    <h3 className="text-lg font-bold mb-1">Growth</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-black" style={{ color: ORANGE }}>$497</span>
                      <span className="text-sm text-white/40">/mo</span>
                    </div>
                    <p className="text-sm text-[#9a9cb8] mb-6">
                      The full engine — monitoring, optimization, and active management.
                    </p>
                    <div className="space-y-3 mb-8">
                      {[
                        "Daily competitor monitoring",
                        "AI-powered review responses",
                        "Full analytics dashboard",
                        "Google Maps optimization",
                        "Social media content calendar",
                        "Google Business Profile management",
                        "WhatsApp approval workflow",
                        "Monthly performance report",
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                          <CheckIcon /> {f}
                        </div>
                      ))}
                    </div>
                    <a
                      href={WA_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 text-xs font-bold tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${ORANGE}, #f0a860)`,
                        color: DARK,
                        boxShadow: "0 4px 15px rgba(232,134,58,0.25)",
                      }}
                      onClick={() => trackConversion("pricing_growth_click")}
                    >
                      Get Started
                    </a>
                  </GlassCard>
                </div>

                {/* Premium */}
                <GlassCard className="p-8">
                  <h3 className="text-lg font-bold mb-1">Premium</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black" style={{ color: ORANGE }}>$797</span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>
                  <p className="text-sm text-[#9a9cb8] mb-6">
                    Everything in Growth plus hands-on strategy and priority support.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Everything in Growth",
                      "GBP post automation",
                      "Bi-weekly strategy calls",
                      "Priority support",
                      "Website issue monitoring",
                      "Quarterly competitive deep-dive",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                        <CheckIcon /> {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 text-xs font-bold tracking-[0.1em] uppercase rounded-full border transition-all duration-300 hover:-translate-y-0.5"
                    style={{ borderColor: ORANGE, color: ORANGE }}
                    onClick={() => trackConversion("pricing_premium_click")}
                  >
                    Get Started
                  </a>
                </GlassCard>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* ROI — Market opportunity (NEW)                                    */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTag>The Math</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <SectionTitle white="One Kitchen Lead Pays for" orange="a Full Year." />
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mb-14 text-[#9a9cb8]">
                Plano homeowners are searching right now. Spring is peak season in DFW — the #1 real
                estate market in the US. Here&rsquo;s what the numbers look like.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { value: "$15K–$50K", label: "Avg Kitchen Remodel", sub: "in Plano, TX" },
                  { value: "$146K", label: "Avg Household Income", sub: "prime renovation budget" },
                  { value: "9,706", label: "Contractors in Plano", sub: "most are invisible online" },
                  { value: "Spring '26", label: "Peak Booking Season", sub: "starting right now" },
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-6 text-center">
                    <div className="text-xl md:text-2xl font-black mb-1" style={{ color: ORANGE }}>{stat.value}</div>
                    <div className="text-xs font-bold text-white/80 mb-1">{stat.label}</div>
                    <div className="text-[0.65rem] text-white/40">{stat.sub}</div>
                  </GlassCard>
                ))}
              </div>
            </Reveal>

            <Reveal delay={400}>
              <GlassCard className="p-8 md:p-10" glow>
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="flex-shrink-0">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: ORANGE_DIM, animation: "pulseGlow 3s ease-in-out infinite" }}
                    >
                      <TrendingUpIcon />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">The ROI is simple.</h3>
                    <p className="text-sm text-[#9a9cb8] leading-relaxed max-w-2xl">
                      At $497/mo, your annual investment is $5,964. One kitchen remodel lead is worth
                      $15,000–$50,000. That means <strong className="text-white">a single converted
                      lead pays for 2.5–8 years of service</strong>. Your competitors are getting those
                      leads right now because they show up online. You should too.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA                                                         */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, rgba(232,134,58,0.06) 0%, transparent 60%)`,
              }}
            />
          </div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <Reveal>
              <SectionTag>Ready?</SectionTag>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-6">
                Your Competitors Are Online.{" "}
                <span className="bg-gradient-to-r from-[#E8863A] via-[#f0a860] to-[#E8863A] bg-clip-text text-transparent">
                  You Should Be Too.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base font-light leading-relaxed max-w-xl mx-auto mb-10 text-[#9a9cb8]">
                Spring is peak booking season in DFW. Every day without an online presence is a
                $15K–$50K kitchen remodel that goes to someone else. Let&rsquo;s make sure the next
                one goes to you.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 font-bold text-sm tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE}, #f0a860, ${ORANGE})`,
                  color: DARK,
                  boxShadow: `0 6px 25px rgba(232,134,58,0.3)`,
                }}
                onClick={() => trackConversion("final_cta_whatsapp_click")}
              >
                <WhatsAppIcon /> Let&rsquo;s Talk on WhatsApp
              </a>
            </Reveal>
            <Reveal delay={400}>
              <p className="text-xs text-white/30 mt-8 max-w-md mx-auto">
                Join 222,249 Texas contractors who know — the best work wins when people can find it.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER                                                            */}
        {/* ================================================================ */}
        <footer className="py-10 px-[4%] border-t border-white/5" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-bold text-white/60">GP Homes and Repairs</span>
              <span>3624 Marwick Drive, Plano, TX 75075</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-white/50">(469) 444-7777</span>
              <span>Licensed &bull; Bonded &bull; Insured</span>
            </div>
            <div className="text-center md:text-right">
              <span>Powered by </span>
              <span className="font-bold" style={{ color: ORANGE }}>SuperSeller AI</span>
            </div>
          </div>
        </footer>

        {/* WhatsApp FAB */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-110"
          style={{ background: "#25d366" }}
          onClick={() => trackConversion("fab_whatsapp_click")}
        >
          <WhatsAppIcon />
        </a>
      </div>
    </>
  );
}
