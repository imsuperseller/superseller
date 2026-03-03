'use client';

import { Users } from 'lucide-react';

export interface PortalLead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-cyan-500/20 text-cyan-400',
    contacted: 'bg-orange-500/20 text-orange-400',
    qualified: 'bg-blue-500/20 text-blue-400',
    quoted: 'bg-purple-500/20 text-purple-400',
    converted: 'bg-green-500/20 text-green-400',
    lost: 'bg-red-500/20 text-red-400',
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
}

export function PortalLeadTable({ leads }: { leads: PortalLead[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-white/50" />
                <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
                {leads.length > 0 && (
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                        {leads.length}
                    </span>
                )}
            </div>
            {leads.length === 0 ? (
                <p className="text-sm text-white/40">No leads yet. Your AI agents are working on it.</p>
            ) : (
                <div className="space-y-2">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-colors hover:bg-white/[0.07]"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{lead.name}</p>
                                <p className="text-xs text-white/50">
                                    {lead.email || lead.phone || 'No contact'}
                                    <span className="ml-2 text-white/30">{formatDate(lead.createdAt)}</span>
                                </p>
                            </div>
                            <span
                                className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[lead.status] || 'bg-white/10 text-white/60'}`}
                            >
                                {lead.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
