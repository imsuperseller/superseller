"use client";

import { useState } from "react";

interface Props {
  tenantSlug: string;
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  ctaColor: string;
}

export default function OnboardingForm({
  tenantSlug,
  tenantName,
  logoUrl,
  primaryColor,
  accentColor,
  ctaColor,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [wantsSoraCameo, setWantsSoraCameo] = useState(false);
  const [cameoDescription, setCameoDescription] = useState("");
  const [cameoStyle, setCameoStyle] = useState("");
  const [cameoOutfit, setCameoOutfit] = useState("");
  const [cameoPersonality, setCameoPersonality] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("שם ואימייל הם שדות חובה / Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboard/${tenantSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: role.trim(),
          soraCameo: wantsSoraCameo
            ? {
                description: cameoDescription.trim(),
                style: cameoStyle.trim(),
                outfit: cameoOutfit.trim(),
                personality: cameoPersonality.trim(),
              }
            : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0a1a 100%)` }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
        >
          {logoUrl && (
            <img src={logoUrl} alt={tenantName} className="h-16 mx-auto mb-6 object-contain" />
          )}
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">!ברוך הבא לצוות</h2>
          <h3 className="text-xl text-white/80 mb-4">Welcome to the team!</h3>
          <p className="text-white/60 text-sm mb-6">
            {name}, you&apos;re all set. You now have access to the competitor research tool and
            the content approval system.
          </p>
          <a
            href={`/compete/${tenantSlug}`}
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{ background: ctaColor }}
          >
            מחקר מתחרים ← / Go to Competitor Research →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0a1a 100%)` }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          {logoUrl && (
            <img src={logoUrl} alt={tenantName} className="h-20 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-3xl font-bold text-white mb-1">{tenantName}</h1>
          <p className="text-white/60 text-sm">Team Onboarding / הצטרפות לצוות</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
        >
          {/* Name */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              שם מלא / Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eliran Cohen"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              אימייל / Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              טלפון / Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-XXX-XXX-XXXX"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              תפקיד / Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Project Manager, Crew Lead..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition"
            />
          </div>

          {/* Sora Cameo Toggle */}
          <div
            className="rounded-xl p-4 border transition-all cursor-pointer"
            style={{
              background: wantsSoraCameo ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
              borderColor: wantsSoraCameo ? accentColor : "rgba(255,255,255,0.1)",
            }}
            onClick={() => setWantsSoraCameo(!wantsSoraCameo)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: wantsSoraCameo ? accentColor : "rgba(255,255,255,0.3)",
                  background: wantsSoraCameo ? accentColor : "transparent",
                }}
              >
                {wantsSoraCameo && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">🎬 Sora Cameo — AI Video Character</p>
                <p className="text-white/50 text-xs">
                  אני רוצה שייצרו לי דמות AI לסרטונים / I want an AI character for videos
                </p>
              </div>
            </div>
          </div>

          {/* Sora Cameo Fields */}
          {wantsSoraCameo && (
            <div className="space-y-4 pl-2 border-l-2" style={{ borderColor: accentColor }}>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">
                  תאר/י את עצמך / Describe yourself
                </label>
                <textarea
                  value={cameoDescription}
                  onChange={(e) => setCameoDescription(e.target.value)}
                  placeholder="גובה, מבנה גוף, צבע שיער, צבע עיניים... / Height, build, hair color, eye color..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">
                  סגנון לבוש / Clothing Style
                </label>
                <input
                  type="text"
                  value={cameoOutfit}
                  onChange={(e) => setCameoOutfit(e.target.value)}
                  placeholder="חולצת עבודה, קסדה, ג'ינס... / Work shirt, hard hat, jeans..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">
                  סגנון ויזואלי / Visual Style
                </label>
                <input
                  type="text"
                  value={cameoStyle}
                  onChange={(e) => setCameoStyle(e.target.value)}
                  placeholder="סינמטי, מקצועי, קליל... / Cinematic, professional, casual..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">
                  אישיות / Personality
                </label>
                <input
                  type="text"
                  value={cameoPersonality}
                  onChange={(e) => setCameoPersonality(e.target.value)}
                  placeholder="רציני, מצחיק, מקצועי... / Serious, funny, professional..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30 focus:outline-none transition text-sm"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg p-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: ctaColor }}
          >
            {submitting ? "...שולח" : "הצטרף לצוות / Join the Team →"}
          </button>

          <p className="text-white/30 text-xs text-center">
            By joining you get access to the competitor research tool and content approval system.
          </p>
        </form>
      </div>
    </div>
  );
}
