"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

type Method = "whatsapp" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("whatsapp");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  async function handleSend() {
    setError(null);
    setLoading(true);

    try {
      if (method === "whatsapp") {
        const res = await fetch("/api/auth/whatsapp-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: value }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "שליחת הקוד נכשלה");
        }
        setSent(true);
      } else {
        const res = await fetch("/api/auth/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "שליחת הלינק נכשלה");
        }
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    setOtpLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value, code: otpCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "קוד שגוי");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "האימות נכשל");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-rubik text-4xl font-black text-white mb-2">
            Winner Video Studio
          </h1>
          <p className="text-gray-500">קבוצת מבנים</p>
        </div>

        <Card className="p-8 rounded-[3rem]">
          {/* Method tabs */}
          <div className="flex gap-2 mb-6 bg-black/30 rounded-2xl p-1">
            <button
              onClick={() => { setMethod("whatsapp"); setSent(false); setError(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                method === "whatsapp"
                  ? "bg-winner-primary text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              וואטסאפ
            </button>
            <button
              onClick={() => { setMethod("email"); setSent(false); setError(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                method === "email"
                  ? "bg-winner-primary text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              אימייל
            </button>
          </div>

          {!sent ? (
            /* Input + Send */
            <div className="space-y-4">
              <Input
                type={method === "email" ? "email" : "tel"}
                placeholder={method === "email" ? "name@company.com" : "050-123-4567"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                dir="ltr"
                autoFocus
              />

              {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

              <Button
                onClick={handleSend}
                loading={loading}
                disabled={!value.trim()}
                className="w-full"
                size="lg"
              >
                {method === "whatsapp" ? "שלח קוד כניסה" : "שלח לינק כניסה"}
              </Button>
            </div>
          ) : method === "whatsapp" ? (
            /* OTP input */
            <div className="space-y-4">
              <p className="text-center text-gray-400 text-sm mb-4">
                שלחנו קוד לוואטסאפ שלך
              </p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                dir="ltr"
                autoFocus
              />

              {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

              <Button
                onClick={handleVerifyOtp}
                loading={otpLoading}
                disabled={otpCode.length !== 6}
                className="w-full"
                size="lg"
              >
                אימות
              </Button>

              <button
                onClick={() => { setSent(false); setOtpCode(""); setError(null); }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-300"
              >
                שלח שוב
              </button>
            </div>
          ) : (
            /* Email sent confirmation */
            <div className="text-center space-y-4">
              <div className="text-4xl">✉️</div>
              <p className="text-white font-bold">בדוק את המייל</p>
              <p className="text-gray-400 text-sm">
                שלחנו לינק כניסה ל-<span className="text-white">{value}</span>
              </p>
              <button
                onClick={() => { setSent(false); setError(null); }}
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                שלח שוב
              </button>
            </div>
          )}
        </Card>

        <p className="text-center text-gray-600 text-xs mt-6">
          SuperSeller AI
        </p>
      </div>
    </div>
  );
}
