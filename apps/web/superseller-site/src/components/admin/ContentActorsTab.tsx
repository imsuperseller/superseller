'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Plus, Edit3, User, Mic, Video, X } from 'lucide-react';

interface ContentActor {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  soraCameoUrl: string | null;
  thumbnailUrl: string | null;
  voiceId: string | null;
  appearanceNotes: string | null;
  availableFor: string[];
  usageCount: number;
  avgEngagement: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Summary {
  total: number;
  withVoice: number;
  withCameo: number;
  tenantCount: number;
  tenants: string[];
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pm: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  crew: 'bg-green-500/20 text-green-400 border-green-500/30',
  model: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const FORMAT_COLORS: Record<string, string> = {
  reel: 'bg-pink-500/20 text-pink-400',
  story: 'bg-blue-500/20 text-blue-400',
  carousel: 'bg-orange-500/20 text-orange-400',
};

export default function ContentActorsTab() {
  const [actors, setActors] = useState<ContentActor[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantFilter, setTenantFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add/Edit form state
  const [formData, setFormData] = useState({
    tenantId: '', name: '', role: 'crew',
    soraCameoUrl: '', voiceId: '', appearanceNotes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = tenantFilter ? `?tenantId=${tenantFilter}` : '';
      const res = await fetch(`/api/admin/content-actors${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setActors(json.actors || []);
      setSummary(json.summary || null);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tenantFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;
      const res = await fetch('/api/admin/content-actors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ tenantId: '', name: '', role: 'crew', soraCameoUrl: '', voiceId: '', appearanceNotes: '' });
      fetchData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startEdit = (actor: ContentActor) => {
    setEditingId(actor.id);
    setFormData({
      tenantId: actor.tenantId,
      name: actor.name,
      role: actor.role,
      soraCameoUrl: actor.soraCameoUrl || '',
      voiceId: actor.voiceId || '',
      appearanceNotes: actor.appearanceNotes || '',
    });
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ tenantId: '', name: '', role: 'crew', soraCameoUrl: '', voiceId: '', appearanceNotes: '' });
  };

  // Group by tenant
  const grouped = actors.reduce<Record<string, ContentActor[]>>((acc, a) => {
    (acc[a.tenantId] = acc[a.tenantId] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Actors', value: summary.total, color: 'text-white' },
            { label: 'With Voice', value: summary.withVoice, color: 'text-cyan-400' },
            { label: 'With Cameo', value: summary.withCameo, color: 'text-purple-400' },
            { label: 'Tenants', value: summary.tenantCount, color: 'text-orange-400' },
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

        <button
          onClick={() => { cancelForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Actor
        </button>

        {summary && summary.tenants.length > 1 && (
          <select
            value={tenantFilter}
            onChange={e => setTenantFilter(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
          >
            <option value="">All Tenants</option>
            {summary.tenants.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <span className="text-white/40 text-xs ml-auto">{actors.length} actors</span>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">{editingId ? 'Edit Actor' : 'Add New Actor'}</h3>
            <button onClick={cancelForm} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1">Tenant ID *</label>
              <input
                value={formData.tenantId}
                onChange={e => setFormData(p => ({ ...p, tenantId: e.target.value }))}
                placeholder="e.g. elite-pro-remodeling"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Name *</label>
              <input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Saar Bitton"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="owner">Owner</option>
                <option value="pm">PM</option>
                <option value="crew">Crew</option>
                <option value="model">Model</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Voice ID (ElevenLabs)</label>
              <input
                value={formData.voiceId}
                onChange={e => setFormData(p => ({ ...p, voiceId: e.target.value }))}
                placeholder="ElevenLabs voice ID"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Sora Cameo URL</label>
              <input
                value={formData.soraCameoUrl}
                onChange={e => setFormData(p => ({ ...p, soraCameoUrl: e.target.value }))}
                placeholder="Sora cameo ID or URL"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Appearance Notes</label>
              <input
                value={formData.appearanceNotes}
                onChange={e => setFormData(p => ({ ...p, appearanceNotes: e.target.value }))}
                placeholder="Height, build, hair..."
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-sm transition">
              {editingId ? 'Save Changes' : 'Create Actor'}
            </button>
            <button onClick={cancelForm} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && actors.length === 0 && (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Loading content actors...
        </div>
      )}

      {/* Empty */}
      {!loading && actors.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg font-bold mb-2">No content actors found</p>
          <p className="text-sm">Add actors using the button above or run the seed script.</p>
        </div>
      )}

      {/* Actor Cards grouped by tenant */}
      {Object.entries(grouped).map(([tenant, tenantActors]) => (
        <div key={tenant} className="space-y-3">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold border-b border-white/10 pb-2">
            {tenant} <span className="text-white/30">({tenantActors.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tenantActors.map(actor => (
              <div key={actor.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {actor.thumbnailUrl ? (
                      <img src={actor.thumbnailUrl} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/40" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold text-sm">{actor.name}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${ROLE_COLORS[actor.role] || 'bg-white/10 text-white/50 border-white/10'}`}>
                        {actor.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(actor)}
                    className="text-white/30 hover:text-white/70 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {actor.voiceId && (
                    <span className="flex items-center gap-1 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-lg">
                      <Mic className="w-3 h-3" /> Voice
                    </span>
                  )}
                  {actor.soraCameoUrl && (
                    <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg">
                      <Video className="w-3 h-3" /> Cameo
                    </span>
                  )}
                </div>

                {/* Available For */}
                {Array.isArray(actor.availableFor) && actor.availableFor.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {actor.availableFor.map(f => (
                      <span key={f} className={`text-xs px-2 py-0.5 rounded ${FORMAT_COLORS[f] || 'bg-white/10 text-white/50'}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Appearance Notes */}
                {actor.appearanceNotes && (
                  <p className="text-white/40 text-xs italic line-clamp-2">{actor.appearanceNotes}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-white/30 pt-2 border-t border-white/5">
                  <span>Used: <span className="text-white/60 font-bold">{actor.usageCount}x</span></span>
                  {actor.avgEngagement != null && (
                    <span>Eng: <span className="text-white/60 font-bold">{(actor.avgEngagement * 100).toFixed(1)}%</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
