"use client";

import { useState } from "react";
import type { ContractorSiteConfig } from "./types";

export function ContactPageClient({ site }: { site: ContractorSiteConfig }) {
  const c = site.colors;
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: site.slug,
          name: form.name,
          phone: form.phone,
          email: form.email,
          metadata: { service: form.service, message: form.message, source: "contractor-site" },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputStyle = {
    borderColor: c.border,
    color: c.textDark,
    background: c.background,
  };

  return (
    <>
      <style>{`
        @keyframes siteRevealUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: c.primary }}>
            Get Your Free Estimate
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: c.textMid }}>
            Tell us about your project and we&apos;ll get back to you within 24 hours with a detailed quote.
          </p>
        </div>
      </section>

      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3" style={{ animation: "siteRevealUp 0.7s ease-out both" }}>
              {status === "sent" ? (
                <div
                  className="p-8 rounded-xl border text-center"
                  style={{ borderColor: "#22C55E", background: "#F0FDF4" }}
                >
                  <div className="text-4xl mb-4">✅</div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: c.primary }}>
                    Request Received!
                  </h2>
                  <p style={{ color: c.textMid }}>
                    We&apos;ll contact you within 24 hours. For urgent requests, call us at{" "}
                    <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="font-bold" style={{ color: c.accent }}>
                      {site.phone}
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: c.textDark }}>
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                        style={{ ...inputStyle, "--tw-ring-color": c.accent } as React.CSSProperties}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: c.textDark }}>
                        Phone Number *
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                        style={{ ...inputStyle, "--tw-ring-color": c.accent } as React.CSSProperties}
                        placeholder="(469) 555-1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: c.textDark }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                      style={{ ...inputStyle, "--tw-ring-color": c.accent } as React.CSSProperties}
                      placeholder="you@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: c.textDark }}>
                      Service Needed
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                      style={{ ...inputStyle, "--tw-ring-color": c.accent } as React.CSSProperties}
                    >
                      <option value="">Select a service...</option>
                      {site.services.map((svc) => (
                        <option key={svc.slug} value={svc.name}>
                          {svc.name}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: c.textDark }}>
                      Project Details
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{ ...inputStyle, "--tw-ring-color": c.accent } as React.CSSProperties}
                      placeholder="Tell us about your project — size, timeline, budget range..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: c.accent }}
                  >
                    {status === "sending" ? "Sending..." : "Request Free Estimate"}
                  </button>

                  {status === "error" && (
                    <p className="text-sm text-red-600 mt-2">
                      Something went wrong. Please call us at {site.phone} instead.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Contact info — 2 cols */}
            <div className="lg:col-span-2" style={{ animation: "siteRevealUp 0.7s ease-out 200ms both" }}>
              <div className="space-y-6">
                {/* Phone */}
                <div className="p-6 rounded-xl border" style={{ borderColor: c.border, background: c.backgroundAlt }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ background: c.accent }}
                    >
                      📞
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: c.textLight }}>
                        Call Us
                      </div>
                      <a
                        href={`tel:${site.phone.replace(/\D/g, "")}`}
                        className="text-lg font-bold hover:underline"
                        style={{ color: c.primary }}
                      >
                        {site.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="p-6 rounded-xl border" style={{ borderColor: c.border, background: c.backgroundAlt }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ background: c.primary }}
                    >
                      📍
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: c.textLight }}>
                        Our Location
                      </div>
                      <div className="text-sm font-semibold" style={{ color: c.textDark }}>
                        {site.address.street}
                      </div>
                      <div className="text-sm" style={{ color: c.textMid }}>
                        {site.address.city}, {site.address.state} {site.address.zip}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="p-6 rounded-xl border" style={{ borderColor: c.border, background: c.backgroundAlt }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ background: c.primary }}
                    >
                      🕐
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: c.textLight }}>
                        Business Hours
                      </div>
                      <div className="text-sm font-semibold" style={{ color: c.textDark }}>
                        Mon – Sat: 7:00 AM – 6:00 PM
                      </div>
                      <div className="text-sm" style={{ color: c.textMid }}>
                        Sunday: By Appointment
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service areas preview */}
                <div className="p-6 rounded-xl border" style={{ borderColor: c.border, background: c.backgroundAlt }}>
                  <div className="text-sm font-bold mb-3" style={{ color: c.primary }}>
                    We Serve
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {site.serviceAreas.slice(0, 6).map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ background: c.background, color: c.textMid, border: `1px solid ${c.border}` }}
                      >
                        {area}
                      </span>
                    ))}
                    {site.serviceAreas.length > 6 && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ color: c.accent }}>
                        +{site.serviceAreas.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
