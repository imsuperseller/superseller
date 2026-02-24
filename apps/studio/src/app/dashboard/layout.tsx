"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { WinnerUser } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { DashboardContext, type DashboardCredits } from "./context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<WinnerUser | null>(null);
  const [credits, setCredits] = useState<DashboardCredits | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setCredits(data.credits);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function refreshCredits() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch {}
  }

  useEffect(() => {
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const activePage = pathname?.includes("/gallery") ? "gallery" : "generate";

  return (
    <DashboardContext.Provider value={{ user, credits, refreshCredits }}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0c0c0e]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="font-rubik font-black text-white text-lg">Winner</span>
              <nav className="flex gap-1">
                <a
                  href="/dashboard"
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    activePage === "generate"
                      ? "text-winner-accent"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  יצירה
                </a>
                <a
                  href="/dashboard/gallery"
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    activePage === "gallery"
                      ? "text-winner-accent"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  גלריה
                </a>
              </nav>
            </div>

            {/* Credits badge */}
            {credits && (
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${
                  credits.available === 0
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                    : credits.available <= 2
                      ? "bg-winner-primary/20 border-winner-accent/20 text-winner-accent animate-pulse"
                      : "bg-winner-primary/20 border-winner-accent/20 text-winner-accent"
                }`}
              >
                <span>⚡</span>
                <span>{credits.available} / {credits.total}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
