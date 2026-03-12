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
const SHOWREEL = `${R2}/hair-approach/showreel/master-16x9.mp4`;

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
  const inView = useInView(ref, { once: true, margin: "-80px" });
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
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
            href="#contact"
            className="text-[0.65rem] sm:text-xs font-bold tracking-[0.1em] uppercase px-3 sm:px-6 py-2 sm:py-3 rounded-sm transition-all duration-300 hover:text-[#0a0c1a] whitespace-nowrap"
            style={{ border: `1.5px solid ${GOLD}`, color: GOLD }}
            onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = DARK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = GOLD; }}
          >
            Book Free Consultation
          </a>
        </header>

        {/* ================================================================ */}
        {/* HERO — Full viewport, left-aligned                               */}
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
                Built Exclusively for Hair Approach
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(2.8rem,6.5vw,5.2rem)] font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Instagram.<br />
              <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-[length:200%_auto] bg-clip-text text-transparent">
                On Autopilot.
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base font-light leading-relaxed max-w-[600px] mb-10 text-[#9a9cb8]">
              AI-powered content that showcases your best work, writes the captions, generates stunning visuals, and posts — without you lifting a finger.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #e8d48b 50%, ${GOLD} 100%)`,
                  color: DARK,
                  boxShadow: `0 4px 15px rgba(201,169,110,0.2)`,
                }}
              >
                Get Started Today <span>&rarr;</span>
              </a>
              <a
                href="#showreel"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-xs tracking-[0.1em] uppercase rounded-full transition-all duration-300 border border-white/12 backdrop-blur-sm bg-white/[0.03] hover:border-[#C9A96E]/30 hover:bg-[#C9A96E]/5 hover:-translate-y-px"
              >
                Watch Showreel
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
        {/* MARQUEE                                                          */}
        {/* ================================================================ */}
        <div className="py-5 overflow-hidden border-y border-white/5" style={{ background: DARK }}>
          <div className="flex gap-12 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            {["AI Content Creation", "Professional Styling Photos", "Instagram Growth", "Automated Posting", "Branded Reels", "Social Strategy", "AI Content Creation", "Professional Styling Photos", "Instagram Growth", "Automated Posting", "Branded Reels", "Social Strategy"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold tracking-[0.15em] uppercase text-white/50">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
                {item}
              </div>
            ))}
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>

        {/* ================================================================ */}
        {/* YOUR WORK — Portfolio Gallery                                     */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-6xl mx-auto">
            <Reveal><SectionTag>Your Work</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="Stunning Transformations." gold="Silent Instagram." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                You create jaw-dropping color, cuts, and transformations every week. But your feed? Let&rsquo;s make it match your talent.
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
        {/* THE PROBLEM — Pain points                                        */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><SectionTag>The Problem</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="Your Work Speaks for Itself." gold="Your Instagram Doesn't." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-12 text-[#9a9cb8]">
                You&rsquo;re booked solid with clients who love your work. But your social presence? Silent. Inconsistent. Invisible to the next client searching for a stylist in Dallas.
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
                { icon: "scissors", title: "Beautiful Work, Zero Posts", desc: "You finish incredible transformations every day but never find time to photograph, edit, write captions, and post." },
                { icon: "clock", title: "No Time Between Clients", desc: "Your chair is always full. Hiring a social media manager means another expense. Agencies charge thousands and still need your content." },
                { icon: "chart", title: "Other Stylists Are Pulling Ahead", desc: "Other Dallas stylists post daily, build their brand online, and fill their books from Instagram. Every quiet day is a missed client." },
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
        {/* WHAT WE BUILD — Social Mockups                                   */}
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
                  <img src={MOCKUPS[0]} alt="Social mockup — Result showcase" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
                <motion.div variants={scaleIn}>
                  <img src={MOCKUPS[1]} alt="Social mockup — Expert tips" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
                <motion.div variants={scaleIn}>
                  <img src={MOCKUPS[2]} alt="Social mockup — Transformation" className="w-full rounded-lg" loading="lazy" />
                </motion.div>
              </motion.div>
              {/* Right — copy */}
              <div>
                <Reveal><SectionTag>The Transformation</SectionTag></Reveal>
                <Reveal>
                  <SectionTitle white="From Salon Chair to" gold="Scroll-Stopping Post" />
                </Reveal>
                <Reveal>
                  <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-8">
                    Our AI takes your best work and transforms it into professional Instagram content — complete with captions, hashtags, and optimal posting times.
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
                    "AI enhances lighting, composition, and color grading",
                    "Writes captions optimized for the Dallas beauty market",
                    "Generates strategic hashtag sets for maximum reach",
                    "Sends to your WhatsApp for one-tap approval",
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
                Ready for Instagram Reels <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">&amp; Stories</span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-10 max-w-xl mx-auto">
                A branded video showcasing your best work — ready to post, share with clients, or use in stories.
              </p>
            </Reveal>
            <Reveal>
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={PHOTOS.blondeHighlights}
                  className="w-full"
                >
                  <source src={SHOWREEL} type="video/mp4" />
                </video>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW IT WORKS                                                     */}
        {/* ================================================================ */}
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><SectionTag>How It Works</SectionTag></Reveal>
            <Reveal>
              <SectionTitle white="Three Steps." gold="Fully Automated." />
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed max-w-xl mb-16 text-[#9a9cb8]">
                We connect, we build, we run. You approve from your phone and watch your Instagram grow.
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
                { num: "01", title: "We Study Your Brand", desc: "We analyze your portfolio, style, colors, and clientele to build a content strategy that feels authentically you." },
                { num: "02", title: "AI Creates Content", desc: "Every week, our AI generates scroll-stopping posts, reels, and stories — complete with captions and hashtags." },
                { num: "03", title: "You Approve & Post", desc: "Content arrives on WhatsApp. One tap to approve. We post at optimal times. Your Instagram grows while you style." },
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
        <section className="py-24 px-[4%] relative overflow-hidden" style={{ background: DARK }}>
          <div className="max-w-5xl mx-auto text-center">
            <Reveal><SectionTag>What&rsquo;s Included</SectionTag></Reveal>
            <Reveal>
              <h2
                className="text-3xl md:text-[2.8rem] font-black leading-[1.1] tracking-tight mb-4 max-w-xl mx-auto"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Everything Your Instagram{" "}
                <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">
                  Needs to Thrive
                </span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-12 max-w-lg mx-auto">
                A complete content engine. No add-ons, no surprises.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {[
                "16-20 Instagram posts/month",
                "AI-enhanced photo styling",
                "Professional caption writing",
                "Strategic hashtag research",
                "Branded Reels & Stories",
                "Optimal posting schedule",
                "Monthly performance report",
                "WhatsApp approval workflow",
                "Dedicated content strategist",
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-3 px-5 py-4 rounded-lg border border-white/8 text-left"
                  style={{ background: BG_CARD }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD} stroke="none" className="flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span className="text-sm font-medium text-white/80">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CONTACT / LEAD FORM                                              */}
        {/* ================================================================ */}
        <section id="contact" className="py-24 px-[4%] relative overflow-hidden" style={{ background: BG }}>
          <div className="max-w-lg mx-auto text-center">
            <Reveal><SectionTag>Get Started</SectionTag></Reveal>
            <Reveal>
              <h2
                className="text-3xl md:text-[2.4rem] font-black leading-[1.1] tracking-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to{" "}
                <span className="bg-gradient-to-r from-[#C9A96E] via-[#e8d48b] to-[#C9A96E] bg-clip-text text-transparent">
                  Transform Your Feed?
                </span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base font-light leading-relaxed text-[#9a9cb8] mb-10">
                Book your free consultation. We&rsquo;ll show you exactly what your Instagram could look like.
              </p>
            </Reveal>

            <motion.div
              className="rounded-2xl p-8 border border-white/10"
              style={{ background: BG_CARD }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {formState === "success" ? (
                <div className="py-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
                  <p className="text-[#9a9cb8]">We&rsquo;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-left">
                    <label htmlFor="ha-name" className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-white/60">Full Name</label>
                    <input
                      type="text" id="ha-name" name="name" required
                      className="w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{ "--tw-ring-color": GOLD } as React.CSSProperties}
                    />
                  </div>
                  <div className="text-left">
                    <label htmlFor="ha-phone" className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-white/60">Phone</label>
                    <input
                      type="tel" id="ha-phone" name="phone" required
                      className="w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{ "--tw-ring-color": GOLD } as React.CSSProperties}
                    />
                  </div>
                  <div className="text-left">
                    <label htmlFor="ha-email" className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-white/60">Email</label>
                    <input
                      type="email" id="ha-email" name="email" required
                      className="w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{ "--tw-ring-color": GOLD } as React.CSSProperties}
                    />
                  </div>
                  {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="w-full py-4 rounded-full font-bold text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD} 0%, #e8d48b 50%, ${GOLD} 100%)`,
                      color: DARK,
                      boxShadow: `0 4px 15px rgba(201,169,110,0.2)`,
                    }}
                  >
                    {formState === "submitting" ? "Sending..." : "Book Free Consultation"}
                  </button>
                  <p className="text-xs text-center text-white/30 mt-3">
                    Your details are secure and will not be shared with third parties
                  </p>
                </form>
              )}
            </motion.div>
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
