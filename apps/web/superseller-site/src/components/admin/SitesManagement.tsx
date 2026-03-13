'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, MapPin, Phone, Building2, RefreshCw, Loader2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

interface SiteConfig {
  id: string;
  tenantId: string;
  phone: string;
  email: string | null;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  website: string | null;
  foundedYear: number | null;
  license: string | null;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  aboutText: string | null;
  uniqueValue: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  yelpUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  googleReviewUrl: string | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  _count?: {
    trustBadges: number;
    stats: number;
    reviewPlatforms: number;
  };
  services?: { id: string; name: string }[];
  serviceAreas?: { id: string; name: string; state: string | null }[];
}

interface SitesSummary {
  total: number;
  active: number;
  prospect: number;
  servicesCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  prospect: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  onboarding: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  churned: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function SitesManagement() {
  const [sites, setSites] = useState<SiteConfig[]>([]);
  const [summary, setSummary] = useState<SitesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sites', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSites(json.sites || []);
      setSummary(json.summary || null);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExpand = (site: SiteConfig) => {
    if (expandedId === site.id) {
      setExpandedId(null);
      setEditForm({});
      return;
    }
    setExpandedId(site.id);
    setEditForm({
      phone: site.phone || '',
      email: site.email || '',
      addressStreet: site.addressStreet || '',
      addressCity: site.addressCity || '',
      addressState: site.addressState || '',
      addressZip: site.addressZip || '',
      website: site.website || '',
      foundedYear: site.foundedYear || '',
      license: site.license || '',
      heroHeadline: site.heroHeadline || '',
      heroSubheadline: site.heroSubheadline || '',
      aboutText: site.aboutText || '',
      uniqueValue: site.uniqueValue || '',
      facebookUrl: site.facebookUrl || '',
      instagramUrl: site.instagramUrl || '',
      yelpUrl: site.yelpUrl || '',
      tiktokUrl: site.tiktokUrl || '',
      youtubeUrl: site.youtubeUrl || '',
      googleReviewUrl: site.googleReviewUrl || '',
    });
  };

  const handleSave = async (siteId: string) => {
    try {
      setSaving(true);
      const payload = {
        ...editForm,
        foundedYear: editForm.foundedYear ? parseInt(editForm.foundedYear, 10) : null,
      };
      const res = await fetch('/api/admin/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siteId, ...payload }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setExpandedId(null);
      setEditForm({});
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const formField = (label: string, key: string, type: 'text' | 'textarea' | 'number' = 'text') => (
    <div key={key}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={editForm[key] || ''}
          onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={editForm[key] || ''}
          onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading sites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center">
        <p className="text-red-400 text-sm font-bold">Error: {error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Client Sites</h2>
          <p className="text-slate-400 font-medium">Manage tenant site configurations, content, and metadata.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sites', value: summary.total, icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Active', value: summary.active, icon: Building2, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Prospect', value: summary.prospect, icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Services', value: summary.servicesCount, icon: Phone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sites Table */}
      <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="col-span-3">Name</div>
          <div className="col-span-1">Slug</div>
          <div className="col-span-2">City / State</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-1">Services</div>
          <div className="col-span-1">Areas</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {sites.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No sites configured yet.</div>
        ) : (
          sites.map(site => (
            <div key={site.id}>
              {/* Row */}
              <div
                onClick={() => handleExpand(site)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/5 items-center"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm font-bold text-white truncate">{site.tenant.name}</span>
                </div>
                <div className="col-span-1 text-xs text-slate-400 font-mono truncate">{site.tenant.slug}</div>
                <div className="col-span-2 text-xs text-slate-400">{site.addressCity}, {site.addressState}</div>
                <div className="col-span-2 text-xs text-slate-400">{site.phone}</div>
                <div className="col-span-1 text-xs text-slate-400">{site.services?.length ?? 0}</div>
                <div className="col-span-1 text-xs text-slate-400">{site.serviceAreas?.length ?? 0}</div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[site.tenant.status] || 'bg-white/5 text-slate-400 border-white/10'}`}>
                    {site.tenant.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {expandedId === site.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>

              {/* Expanded Edit Form */}
              {expandedId === site.id && (
                <div className="px-6 py-6 bg-white/[0.01] border-b border-white/5 space-y-6">
                  {/* Contact & Address */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Contact & Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formField('Phone', 'phone')}
                      {formField('Email', 'email')}
                      {formField('Website', 'website')}
                      {formField('Street Address', 'addressStreet')}
                      {formField('City', 'addressCity')}
                      {formField('State', 'addressState')}
                      {formField('ZIP', 'addressZip')}
                      {formField('Founded Year', 'foundedYear', 'number')}
                      {formField('License #', 'license')}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Site Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formField('Hero Headline', 'heroHeadline')}
                      {formField('Hero Subheadline', 'heroSubheadline')}
                      {formField('About Text', 'aboutText', 'textarea')}
                      {formField('Unique Value', 'uniqueValue', 'textarea')}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formField('Facebook', 'facebookUrl')}
                      {formField('Instagram', 'instagramUrl')}
                      {formField('Yelp', 'yelpUrl')}
                      {formField('TikTok', 'tiktokUrl')}
                      {formField('YouTube', 'youtubeUrl')}
                      {formField('Google Review', 'googleReviewUrl')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleSave(site.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => { setExpandedId(null); setEditForm({}); }}
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
