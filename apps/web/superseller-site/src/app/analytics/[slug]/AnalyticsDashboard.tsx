"use client";

import { useState, useEffect } from "react";

interface Stats {
  slug: string;
  period: { days: number; since: string };
  summary: {
    totalPageViews: number;
    totalConversions: number;
    recentPageViews: number;
    recentConversions: number;
    conversionRate: number;
    legacyViews: number;
    legacySubmissions: number;
  };
  devices: Array<{ device: string; count: number }>;
  dailyViews: Array<{ date: string; count: number }>;
  dailyConversions: Array<{ date: string; count: number }>;
  conversionsByType: Array<{ type: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  createdAt: string;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <p className="text-white/50 text-sm mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ data, label }: { data: Array<{ date: string; count: number }>; label: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <p className="text-white/50 text-sm mb-4">{label}</p>
      <div className="flex items-end gap-[2px] h-24">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${(d.count / max) * 100}%`,
              minHeight: d.count > 0 ? "4px" : "1px",
              background: d.count > 0
                ? "linear-gradient(to top, #C9A96E, #e8d5a8)"
                : "rgba(255,255,255,0.05)",
            }}
            title={`${d.date}: ${d.count}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-white/20">
          {data[0]?.date ? new Date(data[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
        <span className="text-[10px] text-white/20">
          {data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  slug,
  brandName,
}: {
  slug: string;
  brandName: string;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/${slug}/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, days]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {brandName}
            </h1>
            <p className="text-white/40 text-sm mt-1">Analytics Dashboard</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  days === d
                    ? "bg-[#C9A96E] text-black"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <p className="text-white/40 text-center py-20">No data yet.</p>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Page Views"
                value={stats.summary.recentPageViews.toLocaleString()}
                sub={`${stats.summary.totalPageViews.toLocaleString()} all-time`}
              />
              <StatCard
                label="Conversions"
                value={stats.summary.recentConversions.toLocaleString()}
                sub={`${stats.summary.totalConversions.toLocaleString()} all-time`}
              />
              <StatCard
                label="Conversion Rate"
                value={`${stats.summary.conversionRate}%`}
                sub={`Last ${days} days`}
              />
              <StatCard
                label="Leads Captured"
                value={stats.summary.legacySubmissions}
                sub="Form submissions"
              />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <MiniBar data={stats.dailyViews} label={`Daily Views (${days}d)`} />
              <MiniBar data={stats.dailyConversions} label={`Daily Conversions (${days}d)`} />
            </div>

            {/* Breakdown cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Devices */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-white/50 text-sm mb-4">Devices</p>
                {stats.devices.length === 0 ? (
                  <p className="text-white/20 text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.devices.map((d) => {
                      const total = stats.devices.reduce((s, x) => s + x.count, 0);
                      const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={d.device}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70 capitalize">{d.device}</span>
                            <span className="text-white/40">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: "linear-gradient(to right, #C9A96E, #e8d5a8)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Conversion Types */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-white/50 text-sm mb-4">Conversion Types</p>
                {stats.conversionsByType.length === 0 ? (
                  <p className="text-white/20 text-sm">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {stats.conversionsByType.map((c) => {
                      const labels: Record<string, string> = {
                        form_submit: "Form Submissions",
                        whatsapp_click: "WhatsApp Clicks",
                        phone_click: "Phone Clicks",
                        cta_click: "CTA Clicks",
                      };
                      return (
                        <div key={c.type} className="flex justify-between text-sm">
                          <span className="text-white/70">{labels[c.type] || c.type}</span>
                          <span className="text-[#C9A96E] font-bold">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-white/50 text-sm mb-4">Top Referrers</p>
                {stats.topReferrers.length === 0 ? (
                  <p className="text-white/20 text-sm">No referrer data yet</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topReferrers.slice(0, 5).map((r, i) => {
                      let domain = r.referrer;
                      try {
                        domain = new URL(r.referrer).hostname;
                      } catch {}
                      return (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white/70 truncate max-w-[180px]">{domain}</span>
                          <span className="text-[#C9A96E] font-bold">{r.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/20">
                SuperSeller AI Analytics
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
