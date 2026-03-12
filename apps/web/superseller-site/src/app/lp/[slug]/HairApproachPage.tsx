"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import type { LandingPage, Brand } from "@prisma/client";

// ---------------------------------------------------------------------------
// R2 Assets
// ---------------------------------------------------------------------------
const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";
const PHOTOS = {
  blondeHighlights: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg`,
  clientWaves: `${R2}/hair-approach/portfolio/upscaled/gallery_client-waves.jpg`,
  brunetteResult: `${R2}/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg`,
  blondeTransformation: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg`,
  colorChange: `${R2}/hair-approach/portfolio/upscaled/gallery_color-change.jpg`,
  platinumResult: `${R2}/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg`,
};
const MOCKUPS = [
  `${R2}/hair-approach/mockups/mockup-1.png`,
  `${R2}/hair-approach/mockups/mockup-2.png`,
  `${R2}/hair-approach/mockups/mockup-3.png`,
];
const SHOWREEL = `${R2}/hair-approach/showreel/master-16x9.mp4?v=2`;

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
const GOLD = "#C9A96E";
const GOLD_DIM = "rgba(201,169,110,0.15)";
const BG = "#0e1225";
const BG_CARD = "#161a33";
const DARK = "#0a0c1a";

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

// ---------------------------------------------------------------------------
// Reveal wrapper
// ---------------------------------------------------------------------------
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px -40px 0px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Section Tag (pill badge)
// ---------------------------------------------------------------------------
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-8 rounded-sm"
      style={{ color: GOLD, border: `1px solid ${GOLD_DIM}` }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section Title (two-tone)
// ---------------------------------------------------------------------------
function SectionTitle({ white, gold }: { white: string; gold: string }) {
  return (
    <h2 className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-6 max-w-2xl">
      {white} <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">{gold}</span>
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
// Main Component
// ---------------------------------------------------------------------------
export function HairApproachPage({ page }: { page: LandingPage & { brand: Brand | null } }) {
  const [scrolled, setScrolled] = useState(false);
  // Form state removed — CTA now goes directly to WhatsApp

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

  // handleSubmit removed — CTA now goes directly to WhatsApp

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
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
              className="font-extrabold text-base sm:text-lg tracking-[0.12em] uppercase whitespace-nowrap"
              style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}
            >
              Hair Approach
            </span>
            <span className="hidden sm:inline text-white/40 text-sm mx-1">&times;</span>
            <span className="hidden sm:inline font-bold text-sm tracking-[0.1em] uppercase text-white/80">SuperSeller</span>
          </div>
          <a
            href={`https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent("Hi! I just saw the demo page you built for Hair Approach — I'd love to learn more about working together.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] sm:text-xs font-bold tracking-[0.1em] uppercase px-3 sm:px-6 py-2 sm:py-3 rounded-sm transition-all duration-300 hover:text-[#0a0c1a] whitespace-nowrap"
            style={{ border: `1.5px solid ${GOLD}`, color: GOLD }}
            onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = DARK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = GOLD; }}
          >
            Let&rsquo;s Talk
          </a>
        </header>

        {/* ================================================================ */}
        {/* HERO — Personal demo intro                                       */}
        {/* ================================================================ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background photo */}
          <div className="absolute inset-0">
            <img
              src={PHOTOS.blondeHighlights}
              alt="Hair Approach — Sun-Kissed Highlights"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.3)" }}
            />
          </div>
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 40%, rgba(201,169,110,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(10,12,26,0.4) 0%, ${BG} 100%)`,
            }}
          />
          {/* Content */}
          <motion.div
            className="relative z-10 px-[6%] max-w-[900px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 rounded-sm mb-8"
                style={{ color: GOLD, border: `1px solid ${GOLD_DIM}` }}
              >
                Built Exclusively for Deanna
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(2.4rem,5.5vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              30 Years of A-List Talent.<br />
              <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-[length:200%_auto] bg-clip-text text-transparent">
                We Made It Digital.
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base md:text-lg font-light leading-relaxed max-w-[600px] mb-10 text-[#9a9cb8]">
              Deanna, we studied your work, enhanced your photos, built your showreel, analyzed your competition, and created sample content — all before this conversation even started. Scroll down to see everything.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              <a
                href="#whats-ready"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8d48b 50%, ${GOLD} 100%)`,
                  color: DARK,
                  boxShadow: `0 4px 15px rgba(201,169,110,0.2)`,
                }}
              >
                See What We Built <span>&darr;</span>
              </a>
              <a
                href="#showreel"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 border border-white/12 backdrop-blur-sm bg-white/[0.03] hover:border-[#C9A96E]/30 hover:bg-[#C9A96E]/5 hover:-translate-y-px"
              >
                Watch Your Showreel
              </a>
            </motion.div>
          </motion.div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50">
            <span className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ================================================================ */}
        {/* MARQUEE — What we did                                            */}
        {/* ================================================================ */}
        <div className="py-5 overflow-hidden border-y border-white/5" style={{ background: DARK }}>
          <div className="flex gap-12 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            {["Photo Enhancement", "Branded Showreel", "Competition Analysis", "Content Mockups", "Instagram Strategy", "AI Upscaling", "Photo Enhancement", "Branded Showreel", "Competition Analysis", "Content Mockups", "Instagram Strategy", "AI Upscaling"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold tracking-[0.15em] uppercase text-white/50">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
                {item}
              </div>
            ))}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ================================================================ */}
        {/* WHAT'S READY — Enhanced Portfolio                                 */}
        {/* ================================================================ */}
        <section id="whats-ready" className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-6xl mx-auto">
            <Reveal><SectionTag>What We Built</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="Your Photos." gold="Enhanced by Us and Our AI." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                We took 6 of your best transformations, upscaled them to 2K+ resolution with AI, and enhanced the lighting and detail. These are ready for your feed right now.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                { src: PHOTOS.blondeHighlights, label: "Sun-Kissed Highlights", span: "md:col-span-2" },
                { src: PHOTOS.clientWaves, label: "Beach Waves", span: "" },
                { src: PHOTOS.brunetteResult, label: "Rich Brunette", span: "" },
                { src: PHOTOS.colorChange, label: "Color Change", span: "" },
                { src: PHOTOS.platinumResult, label: "Platinum", span: "" },
                { src: PHOTOS.blondeTransformation, label: "Blonde Transformation", span: "md:col-span-2" },
              ].map((photo, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer ${photo.span}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 text-xs font-semibold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SHOWREEL VIDEO                                                   */}
        {/* ================================================================ */}
        <section id="showreel" className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-4xl mx-auto text-center">
            <Reveal><SectionTag>Your Showreel</SectionTag></Reveal>
            <Reveal>
              <h2
                className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                We Made This <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">From Your Photos</span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-10 max-w-xl mx-auto">
                A branded showreel built from your portfolio — with Ken Burns motion, your brand colors, and Playfair Display typography. Ready for Reels, Stories, or sharing with clients.
              </p>
            </Reveal>
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl aspect-video">
              <video
                controls
                playsInline
                preload="metadata"
                poster={PHOTOS.blondeHighlights}
                className="w-full h-full object-cover"
              >
                <source src={SHOWREEL} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SAMPLE CONTENT — Social Mockups                                  */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left — mockups */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={scaleIn} className="col-span-2">
                  <img src={MOCKUPS[0]} alt="Sample Instagram post — Result showcase" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
                <motion.div variants={scaleIn}>
                  <img src={MOCKUPS[1]} alt="Sample Instagram post — Expert tips" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
                <motion.div variants={scaleIn}>
                  <img src={MOCKUPS[2]} alt="Sample Instagram post — Transformation" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
              </motion.div>
              {/* Right — copy */}
              <div>
                <Reveal><SectionTag>Sample Content</SectionTag></Reveal>
                <Reveal>
                  <SectionTitle white="Posts We Created" gold="Using Your Work" />
                </Reveal>
                <Reveal>
                  <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-8">
                    These are sample Instagram posts we designed from your actual photos — with AI-written captions, strategic hashtags, and your brand styling. This is what your feed starts looking like from week one.
                  </p>
                </Reveal>
                <motion.div
                  className="space-y-3"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    "Created from your real portfolio photos",
                    "Captions written for the Dallas beauty market",
                    "Strategic hashtags for maximum local reach",
                    "You approve everything via WhatsApp before it posts",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="flex items-center gap-3 px-5 py-3.5 rounded-lg border border-white/8"
                      style={{ background: BG_CARD }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={GOLD} stroke="none">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-sm font-medium text-white/80">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMPETITOR INTEL — What we researched                             */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><SectionTag>Your Competition</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="We Analyzed 90 Posts" gold="From Dallas Stylists." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                Before building anything, we studied what&rsquo;s working for other stylists in your market — what they post, how often, what gets engagement. We built you a live competitor intelligence dashboard you can access anytime.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                {
                  icon: "search",
                  title: "90 Competitor Posts Analyzed",
                  desc: "We indexed real content from Dallas hair stylists — their posting frequency, content types, engagement patterns, and what drives bookings.",
                },
                {
                  icon: "chart",
                  title: "Live Intelligence Dashboard",
                  desc: "Your own competitor analysis dashboard with real-time data. See what's working in your market and where the opportunities are.",
                  link: "https://superseller.agency/compete/hair-approach",
                  linkText: "View Your Dashboard →",
                },
                {
                  icon: "report",
                  title: "Content Strategy Report",
                  desc: "A full report on your competitive landscape — organic content strategies, posting patterns, and recommendations tailored to your brand.",
                  link: "https://superseller.agency/compete/hair-approach",
                  linkText: "View Your Report →",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="p-7 rounded-xl border border-white/8 transition-all duration-300 hover:border-white/15 hover:-translate-y-1"
                  style={{ background: BG_CARD }}
                >
                  <div className="text-3xl mb-4">
                    {item.icon === "search" ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    ) : item.icon === "chart" ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#9a9cb8] mb-3">{item.desc}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-semibold transition-colors duration-200 hover:underline"
                      style={{ color: GOLD }}
                    >
                      {item.linkText}
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHY — Personal pain points                                       */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><SectionTag>Why This Matters</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="Vidal Sassoon Trained. TV Credits." gold="542 Followers." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                Deanna, you&rsquo;ve been trained by the best, you&rsquo;ve worked on Fox and ABC, and clients love you. But people searching for a stylist in Dallas right now don&rsquo;t know you exist. Your work deserves the audience it&rsquo;s missing.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                { icon: "scissors", title: "World-Class Skill, Quiet Feed", desc: "30+ years of experience, Vidal Sassoon & Toni & Guy training, but your Instagram doesn't tell that story. Every day without content is a client who finds someone else." },
                { icon: "clock", title: "Your Chair Is Full — Your Feed Isn't", desc: "You're booked solid, which is exactly why you can't also be a content creator. You need someone — or something — doing it for you, using your actual work." },
                { icon: "chart", title: "Dallas Stylists Are Posting Daily", desc: "We analyzed your market. Stylists with half your experience are filling books through Instagram because they post consistently. The gap between your talent and your presence is the opportunity." },
              ].map((pain, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="p-7 rounded-xl border border-white/8 transition-all duration-300 hover:border-white/15 hover:-translate-y-1"
                  style={{ background: BG_CARD }}
                >
                  <div className="text-3xl mb-4">
                    {pain.icon === "scissors" ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
                    ) : pain.icon === "clock" ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{pain.title}</h3>
                  <p className="text-sm leading-relaxed text-[#9a9cb8]">{pain.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS                                                     */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><SectionTag>What Happens Next</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="You Say Yes." gold="We Handle Everything." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-16 text-[#9a9cb8]">
                Everything you&rsquo;ve seen on this page was built before we even spoke. Here&rsquo;s what happens when you&rsquo;re ready to start.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                { num: "01", title: "Quick Call", desc: "15 minutes. We walk through what you've seen here, answer your questions, and customize the content strategy to your goals." },
                { num: "02", title: "We Build Your Engine", desc: "We connect to your Instagram, set up your brand profile, and start generating content from your salon photos — every week, automatically." },
                { num: "03", title: "Approve From Your Phone", desc: "Content arrives on WhatsApp. One tap to approve. We post at optimal times. You do hair — we do Instagram." },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="p-8 rounded-xl border border-white/8 transition-all duration-300 hover:border-[#C9A96E]/20 hover:-translate-y-1 group"
                  style={{ background: BG_CARD }}
                >
                  <div
                    className="text-5xl font-black mb-6 tracking-tight transition-colors duration-300 group-hover:text-[#C9A96E]"
                    style={{ color: "rgba(255,255,255,0.08)" }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#9a9cb8]">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT'S INCLUDED                                                  */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto text-center">
            <Reveal><SectionTag>Packages</SectionTag></Reveal>
            <Reveal>
              <h2
                className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-4 max-w-xl mx-auto"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pick Your{" "}
                <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">
                  Growth Plan
                </span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-14 max-w-lg mx-auto">
                No setup fees. No contracts. Cancel anytime. Every plan includes WhatsApp approval — nothing posts without your OK.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                {
                  name: "Starter",
                  price: "$500",
                  desc: "Get your feed moving with consistent, professional content.",
                  features: [
                    "12 Instagram posts/month",
                    "AI-enhanced photo styling",
                    "Professional captions",
                    "Strategic hashtag research",
                    "WhatsApp approval workflow",
                    "Monthly performance report",
                  ],
                  highlighted: false,
                },
                {
                  name: "Growth",
                  price: "$750",
                  desc: "The full engine — posts, Reels, Stories, and competitor intel.",
                  features: [
                    "20 Instagram posts/month",
                    "AI-enhanced photo styling",
                    "Professional captions",
                    "Branded Reels & Stories",
                    "Competitor intelligence dashboard",
                    "Optimal posting schedule",
                    "WhatsApp approval workflow",
                    "Monthly performance report",
                  ],
                  highlighted: true,
                },
                {
                  name: "Premium",
                  price: "$1,000",
                  desc: "Everything in Growth plus video content and priority support.",
                  features: [
                    "Everything in Growth",
                    "Branded showreel videos",
                    "Video content for Reels",
                    "Priority content turnaround",
                    "Dedicated account manager",
                    "Quarterly strategy review",
                  ],
                  highlighted: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className={`relative p-8 rounded-xl border text-left transition-all duration-300 hover:-translate-y-1 ${plan.highlighted ? "border-[#C9A96E]/40" : "border-white/8"}`}
                  style={{
                    background: plan.highlighted
                      ? `linear-gradient(135deg, ${BG_CARD} 0%, rgba(201,169,110,0.08) 100%)`
                      : BG_CARD,
                  }}
                >
                  {plan.highlighted && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold tracking-[0.2em] uppercase px-4 py-1 rounded-full"
                      style={{ background: GOLD, color: DARK }}
                    >
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span
                      className="text-4xl font-black"
                      style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>
                  <p className="text-sm text-[#9a9cb8] mb-6">{plan.desc}</p>
                  <div className="space-y-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD} stroke="none" className="flex-shrink-0">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <span className="text-sm text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent("Hi! I just saw the demo page you built for Hair Approach — I'd love to learn more about working together.")}`}
            target="_blank"
            rel="noopener noreferrer"
                    className="block mt-8 text-center py-3 rounded-full font-bold text-xs tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5"
                    style={plan.highlighted
                      ? { background: `linear-gradient(135deg, ${GOLD} 0%, #e8d48b 50%, ${GOLD} 100%)`, color: DARK }
                      : { border: `1.5px solid ${GOLD}`, color: GOLD }
                    }
                  >
                    Get Started
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SOCIAL REALITY CHECK — Data-driven insights                      */}
        {/* ================================================================ */}
        <section id="contact" className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Reveal><SectionTag>The Numbers Don&rsquo;t Lie</SectionTag></Reveal>
              <Reveal>
                <h2
                  className="text-3xl md:text-[2.4rem] font-black leading-[1.1] tracking-tight mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Where You Stand{" "}
                  <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">
                    vs. Your Market
                  </span>
                </h2>
              </Reveal>
              <Reveal>
                <p className="text-base font-light leading-relaxed text-[#9a9cb8] max-w-2xl mx-auto">
                  We analyzed 90+ posts from Dallas hair stylists with similar experience levels. Here&rsquo;s the gap between your talent and your digital presence.
                </p>
              </Reveal>
            </div>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              {[
                { number: "542", label: "Your Followers", sub: "vs. 2,400 avg for Dallas stylists" },
                { number: "~1/wk", label: "Your Post Frequency", sub: "vs. 4-5/wk for top performers" },
                { number: "12", label: "Avg Likes/Post", sub: "vs. 85+ for stylists your caliber" },
                { number: "0", label: "Reels This Month", sub: "Reels get 2-3x more reach than photos" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="rounded-xl p-5 border border-white/8 text-center"
                  style={{ background: BG_CARD }}
                >
                  <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: GOLD }}>{stat.number}</div>
                  <div className="text-xs font-bold uppercase tracking-wide text-white/80 mb-2">{stat.label}</div>
                  <div className="text-[0.65rem] text-white/40 leading-snug">{stat.sub}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Insight cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <motion.div variants={fadeUp} className="rounded-xl p-6 border border-white/8" style={{ background: BG_CARD }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GOLD_DIM }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">The Opportunity</h3>
                </div>
                <p className="text-sm text-[#9a9cb8] leading-relaxed">
                  Dallas has 1,200+ people searching &ldquo;hair stylist near me&rdquo; every month. Stylists with half your experience are filling chairs through Instagram because they post consistently. Your 30 years of Vidal Sassoon training, Fox and ABC credits — none of that shows up when someone opens Instagram looking for a stylist.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-xl p-6 border border-white/8" style={{ background: BG_CARD }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GOLD_DIM }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">What Top Dallas Stylists Do</h3>
                </div>
                <p className="text-sm text-[#9a9cb8] leading-relaxed">
                  The stylists booking 6+ months out post 4-5 times per week. They mix transformation photos with Reels, behind-the-scenes Stories, and client testimonials. They use local hashtags (#DallasHair #DFWColorist) and post during peak Dallas hours (11am &amp; 7pm CST). Most importantly — they never miss a week.
                </p>
              </motion.div>
            </motion.div>

            {/* Bottom line + CTA */}
            <Reveal>
              <div className="rounded-xl p-8 border text-center" style={{ borderColor: GOLD, background: `linear-gradient(135deg, rgba(201,169,110,0.05), rgba(201,169,110,0.02))` }}>
                <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Bottom line: your work is A-list. Your Instagram is invisible.
                </p>
                <p className="text-sm text-[#9a9cb8] mb-6">
                  Everything you saw on this page — the enhanced photos, the showreel, the content mockups — we built it before this conversation. Imagine what happens when we run it every week.
                </p>
                <a
                  href={`https://wa.me/${page.whatsappNumber}?text=${encodeURIComponent("Hi! I just saw everything you built for Hair Approach — I'm interested in getting started.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, #e8d48b 50%, ${GOLD} 100%)`,
                    color: DARK,
                    boxShadow: `0 4px 15px rgba(201,169,110,0.3)`,
                  }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.325-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Let&rsquo;s Talk on WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}
        <footer className="py-8 px-[4%] text-center border-t border-white/5" style={{ background: DARK }}>
          <p className="font-bold text-sm tracking-[0.1em] uppercase mb-1" style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}>
            Hair Approach by Deanna
          </p>
          {page.phone && (
            <p className="text-xs text-white/40">{page.phone}</p>
          )}
          <p className="text-xs text-white/20 mt-4">
            Powered by <span className="text-white/40">SuperSeller AI</span>
          </p>
        </footer>

        {/* ================================================================ */}
        {/* WHATSAPP FAB                                                     */}
        {/* ================================================================ */}
        {page.whatsappNumber && (
          <a
            href={`https://wa.me/${page.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            onClick={() => trackConversion("whatsapp_click")}
          >
            <WhatsAppIcon />
          </a>
        )}
      </div>
    </>
  );
}
