"use client";

import { useState, useEffect } from "react";

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName: string | null;
  accountId: string | null;
  isActive: boolean;
  tokenExpiry: string | null;
}

const PLATFORMS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    connectUrl: "/api/auth/connect/linkedin",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    connectUrl: "/api/auth/connect/youtube",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    connectUrl: "/api/auth/connect/x",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
] as const;

interface Props {
  userId: string;
}

export function PortalSocialAccounts({ userId }: Props) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/social/accounts?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const getAccountForPlatform = (platformKey: string) =>
    accounts.find((a) => a.platform === platformKey && a.isActive);

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Connected Accounts
        </h3>
        <span className="text-xs text-white/40">
          {accounts.filter((a) => a.isActive).length} connected
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {PLATFORMS.map((platform) => {
            const connected = getAccountForPlatform(platform.key);
            const expired = connected && isExpired(connected.tokenExpiry);

            return (
              <div
                key={platform.key}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white/60">{platform.icon}</div>
                  <div>
                    <span className="text-sm font-medium text-white/80">
                      {platform.label}
                    </span>
                    {connected && (
                      <p className="text-xs text-white/40">
                        {connected.accountName || connected.accountId || "Connected"}
                      </p>
                    )}
                  </div>
                </div>

                {connected && !expired ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Connected
                  </span>
                ) : expired ? (
                  <a
                    href={platform.connectUrl || "#"}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Reconnect
                  </a>
                ) : platform.connectUrl ? (
                  <a
                    href={platform.connectUrl}
                    className="rounded-lg bg-[#f47920]/10 border border-[#f47920]/20 px-3 py-1.5 text-xs font-medium text-[#f47920] hover:bg-[#f47920]/20 transition-colors"
                  >
                    Connect
                  </a>
                ) : (
                  <span className="text-xs text-white/30">Via admin</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
