"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`/api/auth/magic-link/verify?token=${token}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 1000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [params, router]);

  return (
    <div className="text-center">
      {status === "verifying" && <p className="text-gray-500 text-lg">מאמת...</p>}
      {status === "success" && <p className="text-emerald-400 text-lg">אומת בהצלחה! מעביר...</p>}
      {status === "error" && (
        <div>
          <p className="text-rose-400 text-lg mb-4">הלינק פג תוקף או לא תקין</p>
          <a href="/login" className="text-winner-accent hover:underline">
            חזרה להתחברות
          </a>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<p className="text-gray-500 text-lg">טוען...</p>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
