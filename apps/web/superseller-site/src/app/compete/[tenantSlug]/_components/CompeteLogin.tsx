"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { t, type CompeteLocale } from "./compete-i18n";
import { GOLD, THEME } from "./compete-theme";

interface Props {
  tenantSlug: string;
  locale: CompeteLocale;
}

export default function CompeteLogin({ tenantSlug, locale }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRTL = locale === "he";

  const displayName = tenantSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirectTo: `/compete/${tenantSlug}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message || data.error || t("errorSending", locale);
        setError(msg);
        return;
      }
      setSent(true);
    } catch {
      setError(t("networkError", locale));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: THEME.bg }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[400px] rounded-full blur-[120px] opacity-[0.07]"
        style={{ background: GOLD.primary }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] rounded-full blur-[100px] opacity-[0.04]"
        style={{ background: GOLD.warm }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative max-w-sm w-full"
      >
        <div className="rounded-[24px] overflow-hidden backdrop-blur-xl" style={{ background: THEME.bgCard, border: `1px solid ${GOLD.borderSubtle}` }}>
          <div
            className="h-[2px] w-full"
            style={{ background: GOLD.gradientShimmer }}
          />
          <div className="p-8 text-center">
            {/* Lock icon */}
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: GOLD.gradient,
                boxShadow: GOLD.glow,
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {sent ? (
              <>
                <h1
                  className="text-2xl font-black mb-2"
                  style={{ color: THEME.text }}
                >
                  {t("checkEmail", locale)}
                </h1>
                <p
                  className="text-sm mb-1"
                  style={{ color: THEME.textSecondary }}
                >
                  {t("sentLinkTo", locale)}
                </p>
                <p
                  className="text-sm font-bold mb-6"
                  style={{ color: GOLD.primary }}
                >
                  {email}
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: THEME.textMuted }}
                >
                  {t("linkValid", locale)}
                </p>
              </>
            ) : (
              <>
                <h1
                  className="text-2xl font-black mb-1"
                  style={{ color: THEME.text }}
                >
                  {t("competitorResearch", locale)}
                </h1>
                <p
                  className="text-sm mb-1"
                  style={{ color: THEME.textSecondary }}
                >
                  {t("secureAccess", locale)}
                  <span
                    className="font-bold"
                    style={{ color: GOLD.primary }}
                  >
                    {displayName}
                  </span>
                </p>
                <p
                  className="text-[11px] mb-6"
                  style={{ color: THEME.textMuted }}
                >
                  {t("enterEmail", locale)}
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="your@email.com"
                  className="superseller-input w-full text-center rounded-xl px-4 py-3 mb-3"
                  style={{
                    color: "var(--superseller-text-primary)",
                    fontSize: "15px",
                  }}
                  autoFocus
                  dir="ltr"
                />

                {error && (
                  <p
                    className="text-[12px] mb-3 font-semibold"
                    style={{ color: "#ef4444" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSend}
                  disabled={sending || !email.includes("@")}
                  className="w-full py-3 rounded-xl font-bold text-[15px] disabled:opacity-20 cursor-pointer transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: GOLD.gradient, color: '#0e1225', boxShadow: GOLD.glow }}
                >
                  {sending ? t("sending", locale) : t("sendLink", locale)}
                </button>
              </>
            )}
          </div>
        </div>
        <p
          className="text-center mt-6 text-[9px] tracking-[0.2em] uppercase"
          style={{ color: THEME.textMuted, opacity: 0.3 }}
        >
          SuperSeller AI
        </p>
      </motion.div>
    </div>
  );
}
