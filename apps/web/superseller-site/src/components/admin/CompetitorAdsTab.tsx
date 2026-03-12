'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, ThumbsUp, ThumbsDown, ExternalLink, Eye, Filter } from 'lucide-react';

interface CompetitorAd {
  id: string;
  tenantId: string;
  adId: string | null;
  pageName: string | null;
  adUrl: string | null;
  adText: string | null;
  adTitle: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaText: string | null;
  startDate: string | null;
  platforms: string[];
  liked: boolean | null;
  feedbackNote: string | null;
  feedbackBy: string | null;
  feedbackAt: string | null;
  meta: {
    aiAnalysis?: {
      hook?: string;
      angle?: string;
      emotionalTone?: string;
      visualStyle?: string;
      overallScore?: number;
    };
  } | null;
  createdAt: string | null;
}

interface Summary {
  total: number;
  reviewed: number;
  liked: number;
  disliked: number;
  pending: number;
}

type FilterMode = 'all' | 'liked' | 'disliked' | 'pending';

export default function CompetitorAdsTab() {
  const [ads, setAds] = useState<CompetitorAd[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [tenantFilter, setTenantFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = tenantFilter ? `?tenantId=${tenantFilter}` : '';
      const res = await fetch(`/api/admin/competitor-ads${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAds(json.ads || []);
      setSummary(json.summary || null);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tenantFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRate = async (id: string, liked: boolean | null) => {
    try {
      const res = await fetch('/api/admin/competitor-ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, liked }),
      });
      if (!res.ok) throw new Error('Failed to rate');
      setAds(prev => prev.map(a => a.id === id ? { ...a, liked } : a));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filtered = ads.filter(a => {
    if (filter === 'liked') return a.liked === true;
    if (filter === 'disliked') return a.liked === false;
    if (filter === 'pending') return a.liked === null;
    return true;
  });

  const tenants = [...new Set(ads.map(a => a.tenantId))];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Ads', value: summary.total, color: 'text-white' },
            { label: 'Reviewed', value: summary.reviewed, color: 'text-cyan-400' },
            { label: 'Liked', value: summary.liked, color: 'text-green-400' },
            { label: 'Disliked', value: summary.disliked, color: 'text-red-400' },
            { label: 'Pending', value: summary.pending, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-white/50 text-xs uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>

        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {(['all', 'liked', 'disliked', 'pending'] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                filter === f ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {tenants.length > 1 && (
          <select
            value={tenantFilter}
            onChange={e => setTenantFilter(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          >
            <option value="">All Tenants</option>
            {tenants.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <span className="text-white/40 text-xs ml-auto">{filtered.length} ads shown</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && ads.length === 0 && (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Loading competitor ads...
        </div>
      )}

      {/* Empty */}
      {!loading && ads.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg font-bold mb-2">No competitor ads found</p>
          <p className="text-sm">Run the competitor research pipeline to populate this data.</p>
        </div>
      )}

      {/* Ad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ad => {
          const analysis = ad.meta?.aiAnalysis;
          const isExpanded = expandedId === ad.id;

          return (
            <div
              key={ad.id}
              className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${
                ad.liked === true
                  ? 'border-green-500/30'
                  : ad.liked === false
                  ? 'border-red-500/30'
                  : 'border-white/10'
              }`}
            >
              {/* Image/Video Preview */}
              {ad.imageUrl && (
                <div className="relative aspect-video bg-black/30">
                  <img
                    src={ad.imageUrl}
                    alt={ad.adTitle || 'Ad'}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {ad.videoUrl && (
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white/80">
                      VIDEO
                    </div>
                  )}
                  {analysis?.overallScore != null && (
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                      analysis.overallScore >= 8 ? 'bg-green-500 text-black' :
                      analysis.overallScore >= 6 ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {analysis.overallScore}/10
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{ad.pageName || 'Unknown Page'}</p>
                    <p className="text-white/40 text-xs">{ad.tenantId} {ad.startDate ? `| ${ad.startDate}` : ''}</p>
                  </div>
                  {ad.adUrl && (
                    <a href={ad.adUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-cyan-400 transition shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Ad Text (truncated) */}
                {ad.adText && (
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{ad.adText}</p>
                )}

                {/* AI Analysis */}
                {analysis && (
                  <div className="space-y-1">
                    {analysis.hook && (
                      <p className="text-xs"><span className="text-cyan-400 font-bold">Hook:</span> <span className="text-white/60">{analysis.hook}</span></p>
                    )}
                    {analysis.angle && (
                      <p className="text-xs"><span className="text-orange-400 font-bold">Angle:</span> <span className="text-white/60">{analysis.angle}</span></p>
                    )}
                    {isExpanded && (
                      <>
                        {analysis.emotionalTone && (
                          <p className="text-xs"><span className="text-purple-400 font-bold">Tone:</span> <span className="text-white/60">{analysis.emotionalTone}</span></p>
                        )}
                        {analysis.visualStyle && (
                          <p className="text-xs"><span className="text-pink-400 font-bold">Visual:</span> <span className="text-white/60">{analysis.visualStyle}</span></p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* CTA */}
                {ad.ctaText && (
                  <span className="inline-block bg-white/10 text-white/70 text-xs px-2 py-1 rounded-lg">{ad.ctaText}</span>
                )}

                {/* Feedback Note */}
                {ad.feedbackNote && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                    <p className="text-xs text-white/50 italic">&quot;{ad.feedbackNote}&quot;</p>
                    <p className="text-xs text-white/30 mt-1">— {ad.feedbackBy}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleRate(ad.id, ad.liked === true ? null : true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      ad.liked === true
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/5 text-white/40 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" /> Like
                  </button>
                  <button
                    onClick={() => handleRate(ad.id, ad.liked === false ? null : false)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      ad.liked === false
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" /> Dislike
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ad.id)}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/40 hover:text-white/80 transition"
                  >
                    <Eye className="w-3 h-3" /> {isExpanded ? 'Less' : 'More'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
