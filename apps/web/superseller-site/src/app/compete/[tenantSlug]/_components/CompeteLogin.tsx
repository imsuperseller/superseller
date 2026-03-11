"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  tenantSlug: string;
}

export default function CompeteLogin({ tenantSlug }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const msg = data.message || data.error || "שגיאה בשליחת הקישור";
        setError(msg);
        return;
      }
      setSent(true);
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "var(--superseller-bg-primary)" }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[400px] rounded-full blur-[120px] opacity-[0.08]"
        style={{ background: "var(--superseller-orange)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] rounded-full blur-[100px] opacity-[0.06]"
        style={{ background: "var(--superseller-cyan)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative max-w-sm w-full"
      >
        <div className="superseller-card-gradient rounded-[24px] overflow-hidden">
          <div
            className="h-[2px] w-full"
            style={{ background: "var(--superseller-gradient-brand)" }}
          />
          <div className="p-8 text-center">
            {/* Lock icon */}
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--superseller-gradient-primary)",
                boxShadow: "var(--superseller-glow-primary)",
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
                  style={{ color: "var(--superseller-text-primary)" }}
                >
                  בדקו את המייל
                </h1>
                <p
                  className="text-sm mb-1"
                  style={{ color: "var(--superseller-text-secondary)" }}
                >
                  שלחנו קישור כניסה ל-
                </p>
                <p
                  className="text-sm font-bold mb-6"
                  style={{ color: "var(--superseller-cyan)" }}
                >
                  {email}
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--superseller-text-muted)" }}
                >
                  הקישור תקף ל-24 שעות. לא קיבלתם? בדקו ספאם.
                </p>
              </>
            ) : (
              <>
                <h1
                  className="text-2xl font-black mb-1"
                  style={{ color: "var(--superseller-text-primary)" }}
                >
                  מחקר מתחרים
                </h1>
                <p
                  className="text-sm mb-1"
                  style={{ color: "var(--superseller-text-secondary)" }}
                >
                  גישה מאובטחת ל-
                  <span
                    className="font-bold"
                    style={{ color: "var(--superseller-cyan)" }}
                  >
                    {displayName}
                  </span>
                </p>
                <p
                  className="text-[11px] mb-6"
                  style={{ color: "var(--superseller-text-muted)" }}
                >
                  הזינו את המייל שלכם לקבלת קישור כניסה
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
                  className="superseller-btn-3d-primary w-full py-3 rounded-xl font-bold text-[15px] disabled:opacity-20 cursor-pointer"
                >
                  {sending ? "שולח..." : "שלחו לי קישור"}
                </button>
              </>
            )}
          </div>
        </div>
        <p
          className="text-center mt-6 text-[9px] tracking-[0.2em] uppercase"
          style={{ color: "var(--superseller-text-muted)", opacity: 0.3 }}
        >
          SuperSeller AI
        </p>
      </motion.div>
    </div>
  );
}
