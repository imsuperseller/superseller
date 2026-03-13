"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContractorSiteConfig } from "./types";

export function ContractorNav({ site }: { site: ContractorSiteConfig }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/sites/${site.slug}`;
  const c = site.colors;

  const links = [
    { href: base, label: "Home" },
    { href: `${base}/services`, label: "Services" },
    { href: `${base}/portfolio`, label: "Portfolio" },
    { href: `${base}/reviews`, label: "Reviews" },
    { href: `${base}/about`, label: "About" },
    { href: `${base}/service-areas`, label: "Service Areas" },
    { href: `${base}/contact`, label: "Contact" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.95)", borderColor: c.border }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Business Name */}
          <Link href={base} className="flex items-center gap-3 shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-10 w-auto" />
            ) : (
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ color: c.primary }}
              >
                {site.businessName}
              </span>
            )}
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-[0.85rem] font-medium rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: c.textMid }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA + Phone */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${site.phone.replace(/\D/g, "")}`}
              className="text-sm font-semibold"
              style={{ color: c.primary }}
            >
              {site.phone}
            </a>
            <a
              href={`${base}/contact`}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: c.accent }}
            >
              Free Estimate
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t" style={{ borderColor: c.border }}>
            <div className="flex flex-col gap-1 pt-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 text-[0.9rem] font-medium rounded-lg hover:bg-gray-100"
                  style={{ color: c.textMid }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t" style={{ borderColor: c.border }}>
                <a
                  href={`tel:${site.phone.replace(/\D/g, "")}`}
                  className="px-3 py-2.5 text-center font-semibold rounded-lg"
                  style={{ color: c.primary, background: c.backgroundAlt }}
                >
                  Call {site.phone}
                </a>
                <a
                  href={`${base}/contact`}
                  className="px-3 py-2.5 text-center font-bold text-white rounded-lg"
                  style={{ background: c.accent }}
                >
                  Get Free Estimate
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
