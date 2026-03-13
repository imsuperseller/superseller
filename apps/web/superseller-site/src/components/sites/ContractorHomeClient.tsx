"use client";

import Link from "next/link";
import type { ContractorSiteConfig } from "./types";

// ---------------------------------------------------------------------------
// Reveal animation wrapper
// ---------------------------------------------------------------------------
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className || ""} style={{ animation: `siteRevealUp 0.7s ease-out ${delay}ms both` }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star SVG
// ---------------------------------------------------------------------------
function Star({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={color}>
      <path d="M10 1l2.39 4.84L17.82 6.7l-3.91 3.81.92 5.39L10 13.34l-4.83 2.56.92-5.39L2.18 6.7l5.43-.86z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Contractor Home Page — reusable template
// ---------------------------------------------------------------------------
export function ContractorHomeClient({ site }: { site: ContractorSiteConfig }) {
  const c = site.colors;
  const base = `/sites/${site.slug}`;

  return (
    <>
      {/* Animation keyframe */}
      <style>{`
        @keyframes siteRevealUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primary}ee 60%, ${c.accent}33 100%)`,
          minHeight: "600px",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            {/* Trust pill */}
            <Reveal>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-xs font-bold tracking-wide uppercase"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#22C55E" }}
                />
                BuildZoom Top 7% of Texas Contractors
              </span>
            </Reveal>

            {/* Headline */}
            <Reveal delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                {site.heroHeadline}
              </h1>
            </Reveal>

            {/* Subheadline */}
            <Reveal delay={200}>
              <p className="text-lg md:text-xl leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
                {site.heroSubheadline}
              </p>
            </Reveal>

            {/* CTA buttons */}
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`${base}/contact`}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: c.accent, boxShadow: `0 8px 24px ${c.accent}44` }}
                >
                  Get Your Free Estimate
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href={`tel:${site.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    color: "white",
                    border: "2px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call {site.phone}
                </a>
              </div>
            </Reveal>

            {/* Stats row */}
            <Reveal delay={400}>
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                {site.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section style={{ background: c.backgroundAlt }} className="py-6 border-b" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {site.trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 py-2">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: c.textDark }}>{badge.label}</div>
                  {badge.detail && (
                    <div className="text-xs" style={{ color: c.textLight }}>{badge.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-20" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-5 rounded-full"
                style={{ color: c.accent, border: `1.5px solid ${c.accent}`, background: `${c.accent}0d` }}
              >
                Our Services
              </span>
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: c.primary }}
              >
                Everything Your Home Needs,{" "}
                <span style={{ color: c.accent }}>Under One Roof</span>
              </h2>
              <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
                {site.uniqueValue}
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {site.services.map((svc, i) => (
              <Reveal key={svc.slug} delay={i * 60}>
                <Link
                  href={`${base}/services/${svc.slug}`}
                  className="group block p-6 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ borderColor: c.border, background: c.background }}
                >
                  <div className="text-3xl mb-3">{svc.icon}</div>
                  <h3 className="text-base font-bold mb-2 group-hover:underline" style={{ color: c.primary }}>
                    {svc.name}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: c.textMid }}>
                    {svc.shortDescription}
                  </p>
                  <span
                    className="inline-flex items-center mt-3 text-xs font-semibold"
                    style={{ color: c.accent }}
                  >
                    Learn More
                    <svg className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={site.services.length * 60}>
            <div className="text-center mt-10">
              <Link
                href={`${base}/services`}
                className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-lg transition-all hover:scale-[1.02]"
                style={{ color: c.accent, border: `2px solid ${c.accent}` }}
              >
                View All {site.services.length} Services →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20" style={{ background: c.warmBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-5 rounded-full"
                style={{ color: c.accent, border: `1.5px solid ${c.accent}`, background: `${c.accent}0d` }}
              >
                Why Choose Us
              </span>
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: c.primary }}
              >
                Why Plano Homeowners{" "}
                <span style={{ color: c.accent }}>Trust Us</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🏆",
                title: "BuildZoom Top 7%",
                text: `Ranked in the top 7% of 222,249 Texas contractors. Our track record speaks for itself.`,
              },
              {
                icon: "⭐",
                title: "Perfect 5-Star Rating",
                text: "Universal 5-star reviews across every platform. Zero negative reviews — ever.",
              },
              {
                icon: "🔧",
                title: "Full-Service Contractor",
                text: "From small handyman fixes to complete home remodels — one team, one call, one relationship.",
              },
              {
                icon: "📅",
                title: `${new Date().getFullYear() - site.foundedYear}+ Years Experience`,
                text: `Serving ${site.address.city} and North Texas since ${site.foundedYear}. Deep local knowledge and trusted relationships.`,
              },
              {
                icon: "🛡️",
                title: "Licensed, Bonded & Insured",
                text: `${site.license}. Your project and property are fully protected.`,
              },
              {
                icon: "💰",
                title: "Free Estimates",
                text: "No obligation, no pressure. We'll assess your project and provide an honest, transparent quote.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div
                  className="p-7 rounded-xl border h-full"
                  style={{ borderColor: c.border, background: c.background }}
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: c.primary }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: c.textMid }}>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-20" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-5 rounded-full"
                style={{ color: c.accent, border: `1.5px solid ${c.accent}`, background: `${c.accent}0d` }}
              >
                Reviews
              </span>
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: c.primary }}
              >
                What Our Customers{" "}
                <span style={{ color: c.accent }}>Say</span>
              </h2>
              <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
                Universal 5-star ratings across every platform. Zero negative reviews found — anywhere.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {site.reviewPlatforms.map((platform, i) => (
              <Reveal key={platform.name} delay={i * 80}>
                <div
                  className="p-6 rounded-xl border text-center"
                  style={{ borderColor: c.border, background: c.backgroundAlt }}
                >
                  <div className="flex justify-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} color={j < Math.round(platform.rating) ? c.accent : c.border} />
                    ))}
                  </div>
                  <div className="text-2xl font-extrabold mb-1" style={{ color: c.primary }}>
                    {platform.rating.toFixed(1)}
                  </div>
                  <div className="text-sm font-medium" style={{ color: c.textMid }}>
                    {platform.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: c.textLight }}>
                    {platform.count} reviews
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <div className="text-center mt-10">
              <Link
                href={`${base}/reviews`}
                className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-lg transition-all hover:scale-[1.02]"
                style={{ color: c.accent, border: `2px solid ${c.accent}` }}
              >
                See All Reviews →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVICE AREAS ── */}
      <section className="py-20" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <span
                className="inline-block text-[0.65rem] font-bold tracking-[0.25em] uppercase px-5 py-2 mb-5 rounded-full"
                style={{ color: c.accent, border: `1.5px solid ${c.accent}`, background: `${c.accent}0d` }}
              >
                Service Areas
              </span>
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: c.primary }}
              >
                Serving{" "}
                <span style={{ color: c.accent }}>North Texas</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-3">
              {site.serviceAreas.map((area) => (
                <span
                  key={area}
                  className="px-5 py-2.5 text-sm font-medium rounded-full border"
                  style={{ borderColor: c.border, color: c.textDark, background: c.background }}
                >
                  {area}, {site.address.state}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="py-20"
        style={{
          background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primary}ee 60%, ${c.accent}33 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Transform Your Home?
            </h2>
            <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
              Get a free, no-obligation estimate for your project. Call us today or fill out our quick form.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={`${base}/contact`}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: c.accent, boxShadow: `0 8px 24px ${c.accent}44` }}
              >
                Get Free Estimate
              </Link>
              <a
                href={`tel:${site.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
