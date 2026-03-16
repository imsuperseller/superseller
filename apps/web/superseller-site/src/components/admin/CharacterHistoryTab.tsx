'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { History, RotateCcw, Clock, Filter, ChevronDown } from 'lucide-react';

// ─── Types ───

interface Tenant {
  id: string;
  slug: string;
  name: string;
}

interface ChangeDeltaField {
  old: string | number | null;
  new: string | number | null;
}

interface ChangeDeltaRollback {
  rollback: {
    fromVersion: number;
    toVersion: number;
    rolledBackBy: string;
  };
}

type ChangeDelta = Record<string, ChangeDeltaField> | ChangeDeltaRollback | null;

interface CharacterVersion {
  id: string;
  tenantId: string;
  name: string;
  visualStyle: string | null;
  soraHandle: string | null;
  personaDescription: string | null;
  version: number;
  changeDelta: ChangeDelta;
  createdAt: string;
  intent: string | null;
  scope: string | null;
  scene_number: number | null;
  estimated_cost_cents: number | null;
  cr_status: string | null;
  change_summary: string | null;
}

interface ChangeRequest {
  id: string;
  tenant_id: string;
  intent: string;
  scope: string | null;
  scene_number: number | null;
  change_summary: string;
  status: string;
  estimated_cost_cents: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ───

function isRollbackDelta(delta: ChangeDelta): delta is ChangeDeltaRollback {
  return delta !== null && 'rollback' in delta;
}

function formatCost(cents: number | null): string {
  if (cents === null || cents === undefined) return '---';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function getVersionStatusColor(status: string | null): string {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'approved': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'failed': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
}

function getVersionStatusLabel(status: string | null): string {
  if (!status) return 'initial';
  return status;
}

function getCRStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'failed': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'admin-denied': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'pending-admin-approval': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'received': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
}

// ─── Component ───

export default function CharacterHistoryTab() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [versions, setVersions] = useState<CharacterVersion[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [totalCostCents, setTotalCostCents] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [subView, setSubView] = useState<'versions' | 'audit'>('versions');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Load tenants on mount
  useEffect(() => {
    fetch('/api/admin/tenants')
      .then(r => r.json())
      .then(data => setTenants(data.tenants || []))
      .catch(() => {});
  }, []);

  const fetchTenantData = useCallback(async (tenantId: string, filter?: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const crUrl = filter
        ? `/api/admin/change-requests/${tenantId}?status=${filter}`
        : `/api/admin/change-requests/${tenantId}`;

      const [versionsRes, crRes] = await Promise.all([
        fetch(`/api/admin/character-versions/${tenantId}`),
        fetch(crUrl),
      ]);

      const versionsData = await versionsRes.json();
      const crData = await crRes.json();

      setVersions(versionsData.versions || []);
      setChangeRequests(crData.changeRequests || []);
      setTotalCostCents(crData.totalCostCents || 0);
    } catch {
      // silently fail — empty state will show
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setStatusFilter('');
    fetchTenantData(tenantId);
  };

  const handleStatusFilterChange = (filter: string) => {
    setStatusFilter(filter);
    fetchTenantData(selectedTenantId, filter || undefined);
  };

  const handleRollbackConfirm = async () => {
    if (rollbackTarget === null || !selectedTenantId) return;
    setRollbackLoading(true);
    setRollbackError(null);
    try {
      const res = await fetch(
        `/api/admin/character-versions/${selectedTenantId}/rollback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetVersion: rollbackTarget }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      // Re-fetch versions after rollback
      await fetchTenantData(selectedTenantId, statusFilter || undefined);
      setRollbackTarget(null);
    } catch (e: unknown) {
      setRollbackError(e instanceof Error ? e.message : 'Rollback failed');
    } finally {
      setRollbackLoading(false);
    }
  };

  // ─── Version timeline card ───
  const renderVersionCard = (v: CharacterVersion, index: number) => {
    const isLatest = index === 0;
    const delta = v.changeDelta;

    return (
      <div key={v.id} className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-700" />
        {/* Dot */}
        <div className="absolute left-[7px] top-4 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-slate-900" />

        <div className="ml-4 mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded px-2 py-0.5">
                v{v.version}
              </span>
              <span
                className={`text-xs font-medium rounded px-2 py-0.5 ${getVersionStatusColor(v.cr_status)}`}
              >
                {getVersionStatusLabel(v.cr_status)}
              </span>
              {isLatest && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded px-2 py-0.5">
                  current
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(v.createdAt)}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Cost: {formatCost(v.estimated_cost_cents)}
              </span>
              {!isLatest && (
                <button
                  onClick={() => setRollbackTarget(v.version)}
                  className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-400/20 hover:border-orange-400/40 bg-orange-400/5 hover:bg-orange-400/10 rounded px-2 py-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rollback
                </button>
              )}
            </div>
          </div>

          {/* Delta display */}
          <div className="mt-3">
            {!delta && (
              <p className="text-sm text-slate-400 italic">Initial version</p>
            )}
            {delta && isRollbackDelta(delta) && (
              <div className="flex items-center gap-2 text-sm text-orange-300">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <span>
                  Rolled back to{' '}
                  <span className="font-bold text-orange-200">v{delta.rollback.toVersion}</span>
                  {' '}(from v{delta.rollback.fromVersion}) by {delta.rollback.rolledBackBy}
                </span>
              </div>
            )}
            {delta && !isRollbackDelta(delta) && (
              <div className="space-y-1.5">
                {Object.entries(delta as Record<string, ChangeDeltaField>).map(([field, diff]) => (
                  <div key={field} className="flex items-start gap-2 text-xs">
                    <span className="text-slate-400 font-mono min-w-[120px]">{field}:</span>
                    <span className="text-red-400 line-through">{String(diff.old ?? '—')}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-green-400">{String(diff.new ?? '—')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {v.change_summary && (
            <p className="mt-2 text-xs text-slate-400 italic">&ldquo;{v.change_summary}&rdquo;</p>
          )}
        </div>
      </div>
    );
  };

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
          <History className="w-8 h-8 text-cyan-400" />
          Character History
        </h2>
        <p className="text-slate-400 font-medium mt-1">
          View CharacterBible version timeline, rollback to prior versions, and audit all change requests.
        </p>
      </div>

      {/* Tenant selector */}
      <div className="relative inline-block">
        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">
          Customer
        </label>
        <div className="relative">
          <select
            value={selectedTenantId}
            onChange={e => handleTenantSelect(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-cyan-500 min-w-[220px]"
          >
            <option value="">— Select a customer —</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.slug})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Empty state — no tenant selected */}
      {!selectedTenantId && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-700 rounded-xl">
          <History className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Select a customer to view character history</p>
        </div>
      )}

      {/* Content — tenant selected */}
      {selectedTenantId && (
        <>
          {/* Sub-view toggle */}
          <div className="flex gap-2 border-b border-slate-700 pb-0">
            {(['versions', 'audit'] as const).map(view => (
              <button
                key={view}
                onClick={() => setSubView(view)}
                className={`px-5 py-2.5 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors ${
                  subView === view
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {view === 'versions' ? 'Version Timeline' : 'Change Log'}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
              <Clock className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          )}

          {/* Version Timeline */}
          {!loading && subView === 'versions' && (
            <div>
              {versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                  <History className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-base font-medium">No character changes recorded for this customer</p>
                </div>
              ) : (
                <div className="pt-2">
                  {versions.map((v, i) => renderVersionCard(v, i))}
                </div>
              )}
            </div>
          )}

          {/* Audit log */}
          {!loading && subView === 'audit' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <label className="text-xs uppercase tracking-widest text-slate-400">Status:</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => handleStatusFilterChange(e.target.value)}
                    className="appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 pr-9 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All</option>
                    <option value="received">received</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="failed">failed</option>
                    <option value="pending-admin-approval">pending-admin-approval</option>
                    <option value="admin-denied">admin-denied</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {changeRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                  <Clock className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-base font-medium">No change requests for this customer</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs uppercase tracking-widest text-slate-400 bg-slate-800/80 border-b border-slate-700">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Intent</th>
                        <th className="px-4 py-3">Summary</th>
                        <th className="px-4 py-3">Scene(s)</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {changeRequests.map(cr => (
                        <tr key={cr.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(cr.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-cyan-300">{cr.intent}</span>
                          </td>
                          <td className="px-4 py-3 max-w-[240px] truncate" title={cr.change_summary}>
                            {cr.change_summary}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {cr.scope === 'scene' && cr.scene_number !== null
                              ? `Scene ${cr.scene_number}`
                              : cr.scope ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium rounded px-2 py-0.5 ${getCRStatusColor(cr.status)}`}
                            >
                              {cr.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-mono">
                            {formatCost(cr.estimated_cost_cents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-800/60 border-t border-slate-600">
                        <td colSpan={5} className="px-4 py-3 text-xs uppercase tracking-widest text-slate-400 font-bold">
                          Total
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-white">
                          {formatCost(totalCostCents)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Rollback confirmation modal */}
      {rollbackTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold text-white">Confirm Rollback</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">
              Roll back to{' '}
              <span className="font-bold text-orange-300">version {rollbackTarget}</span>?
            </p>
            <p className="text-slate-400 text-xs mb-6">
              This creates a new version with those settings. Future scene generations will use these character settings.
            </p>
            {rollbackError && (
              <p className="text-red-400 text-xs mb-4 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
                {rollbackError}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRollbackTarget(null);
                  setRollbackError(null);
                }}
                disabled={rollbackLoading}
                className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRollbackConfirm}
                disabled={rollbackLoading}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${rollbackLoading ? 'animate-spin' : ''}`} />
                {rollbackLoading ? 'Rolling back...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
