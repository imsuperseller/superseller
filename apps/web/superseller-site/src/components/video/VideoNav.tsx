"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, Plus, CreditCard, User, Menu, X, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VideoNavProps {
  email: string;
  clientId: string;
}

export default function VideoNav({ email, clientId }: VideoNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/video/credits")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.balance === "number") setCredits(d.balance);
      })
      .catch(() => {});
  }, []);

  const links = [
    { href: "/video", label: "My Videos", icon: Video },
    { href: "/video/create", label: "Create", icon: Plus },
    { href: "/video/pricing", label: "Pricing", icon: CreditCard },
    { href: "/video/account", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/video" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 bg-[#fe3d51] rounded-lg flex items-center justify-center">
            <Video size={16} className="text-white" />
          </div>
          <span>TourReel</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/video" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Credits + User */}
        <div className="hidden md:flex items-center gap-4">
          {credits !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
              <Coins size={14} />
              {credits} credits
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[140px] truncate">{email}</span>
          </div>
          <a
            href="/api/auth/logout"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Logout
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a] px-4 py-4 space-y-2">
          {credits !== null && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-3">
              <Coins size={14} />
              {credits} credits
            </div>
          )}
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-gray-400 truncate">{email}</span>
            <a href="/api/auth/logout" className="text-xs text-gray-500 hover:text-gray-300">
              Logout
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
