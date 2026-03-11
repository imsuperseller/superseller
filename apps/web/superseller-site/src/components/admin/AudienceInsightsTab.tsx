'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  BarChart3,
  RefreshCw,
  Loader2,
  ExternalLink,
  Sparkles,
  Target,
  MessageSquare,
} from 'lucide-react';

interface Follower {
  id: string;
  accountId: string;
  platform: string;
  sourceHandle: string;
  followerId: string | null;
  followerUsername: string | null;
  followerName: string | null;
  profileUrl: string | null;
  researchStatus: string | null;
  prospectScore: number | null;
  prospectReasons: unknown;
  fitScore: number | null;
  warmthTier: string | null;
  scrapedAt: string;
  researchedAt: string | null;
  profileBio: string | null;
}

interface AudienceInsight {
  id: string;
  accountId: string;
  platform: string;
  scrapedAt: string | null;
  segments: unknown;
  topProducts: unknown;
  messagingAngles: unknown;
  createdAt: string | null;
}

interface FollowersResponse {
  followers: Follower[];
  summary: { total: number; researched: number; prospects: number };
}

interface InsightsResponse {
  insights: AudienceInsight[];
}

type SubView = 'insights' | 'prospects';

function SegmentItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-300 truncate max-w-[70%]">{label}</span>
      <span className="text-xs font-bold text-cyan-400 tabular-nums">{count}</span>
    </div>
  );
}

function ProductItem({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-300 truncate max-w-[70%]">{name}</span>
      <span className="text-xs font-bold text-orange-400 tabular-nums">{count}</span>
    </div>
  );
}

export default function AudienceInsightsTab() {
  const [subView, setSubView] = useState<SubView>('insights');
  const [followersData, setFollowersData] = useState<FollowersResponse | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fRes, iRes] = await Promise.all([
        fetch('/api/admin/followers'),
        fetch('/api/admin/audience-insights'),
      ]);
      if (!fRes.ok) throw new Error('Failed to fetch followers');
      if (!iRes.ok) throw new Error('Failed to fetch insights');
      const [fJson, iJson] = await Promise.all([fRes.json(), iRes.json()]);
      setFollowersData(fJson);
      setInsightsData(iJson);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !followersData && !insightsData) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Loading audience data…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const summary = followersData?.summary ?? { total: 0, researched: 0, prospects: 0 };
  const insights = insightsData?.insights ?? [];
  const prospects = (followersData?.followers ?? []).filter(
    (f) => f.prospectScore != null && f.prospectScore > 0
  );

  const NAV: Array<{ id: SubView; label: string; icon: typeof Users }> = [
    { id: 'insights', label: 'Audience Insights', icon: BarChart3 },
    { id: 'prospects', label: 'Prospects', icon: Target },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Follower Outreach
          </h2>
          <p className="text-slate-400 font-medium">
            Audience segments, product fit, and prospect list from follower research pipeline.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          disabled={loading}
          className="px-5 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2 self-start disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Total Followers
          </p>
          <p className="text-2xl font-black text-white tabular-nums">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Researched
          </p>
          <p className="text-2xl font-black text-cyan-400 tabular-nums">{summary.researched}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Prospects
          </p>
          <p className="text-2xl font-black text-orange-400 tabular-nums">{summary.prospects}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Platforms
          </p>
          <p className="text-2xl font-black text-white tabular-nums">{insights.length}</p>
        </div>
      </div>

      {/* Sub-view nav */}
      <div className="flex gap-2 flex-wrap">
        {NAV.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubView(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              subView === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── INSIGHTS VIEW ────────────────────────────────────────────── */}
      {subView === 'insights' && (
        <div className="space-y-6">
          {insights.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center">
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No audience insights yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Run <code className="text-cyan-400">follower-aggregate-insights.ts</code> to populate.
              </p>
            </div>
          ) : (
            insights.map((insight) => {
              const segmentsRaw = (insight.segments as Array<{ name?: string; label?: string; count?: number; count_estimate?: number }>) ?? [];
              const segments = segmentsRaw.map((s) => ({
                label: s.name || s.label || 'Unknown',
                count: s.count ?? s.count_estimate ?? 0,
              })).filter((s) => s.label && s.count > 0);
              const topProductsRaw = insight.topProducts;
              let topProducts: Array<{ name: string; count: number }> = [];
              if (Array.isArray(topProductsRaw)) {
                topProducts = (topProductsRaw as Array<{ product?: string; count?: number } | string>).map((p) => ({
                  name: typeof p === 'string' ? p : (p.product ?? String(p)),
                  count: typeof p === 'object' && p && 'count' in p ? (p.count ?? 0) : 1,
                }));
              } else if (topProductsRaw && typeof topProductsRaw === 'object' && !Array.isArray(topProductsRaw)) {
                topProducts = Object.entries(topProductsRaw as Record<string, number>).map(([name, count]) => ({
                  name,
                  count: typeof count === 'number' ? count : parseInt(String(count), 10) || 0,
                })).sort((a, b) => b.count - a.count);
              }
              const anglesRaw = (insight.messagingAngles as Array<string | { angle?: string }>) ?? [];
              const angles = anglesRaw.map((a) => (typeof a === 'string' ? a : (a.angle ?? ''))).filter(Boolean);

              return (
                <div
                  key={insight.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 md:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
                      {insight.platform}
                    </h3>
                    {insight.scrapedAt && (
                      <span className="text-[10px] text-slate-500">
                        Scraped {new Date(insight.scrapedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Segments */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Segments
                      </h4>
                      <div className="space-y-0">
                        {segments.slice(0, 8).map((s, i) => (
                          <SegmentItem key={i} label={s.label} count={s.count} />
                        ))}
                      </div>
                    </div>

                    {/* Top products */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Top Products
                      </h4>
                      <div className="space-y-0">
                        {topProducts.slice(0, 6).map((p, i) => (
                          <ProductItem key={i} name={p.product} count={p.count} />
                        ))}
                      </div>
                    </div>

                    {/* Messaging angles */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Messaging Angles
                      </h4>
                      <ul className="space-y-2">
                        {angles.slice(0, 5).map((a, i) => (
                          <li key={i} className="text-sm text-slate-300">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── PROSPECTS VIEW ──────────────────────────────────────────── */}
      {subView === 'prospects' && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
          {prospects.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No prospects yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Run research pipeline to score followers as prospects.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {prospects.map((f) => (
                <div
                  key={f.id}
                  className="p-4 md:p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white truncate">
                        {f.followerName || f.followerUsername || 'Unknown'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                        {f.platform}
                      </span>
                      {f.warmthTier && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                          {f.warmthTier}
                        </span>
                      )}
                    </div>
                    {f.profileBio && (
                      <p className="text-xs text-slate-500 truncate mt-1 max-w-2xl">
                        {f.profileBio}
                      </p>
                    )}
                    {Array.isArray(f.prospectReasons) && f.prospectReasons.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {(f.prospectReasons as string[]).slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-black text-cyan-400 tabular-nums">
                      {f.prospectScore ?? '—'}
                    </span>
                    {f.profileUrl && (
                      <a
                        href={f.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Open profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
