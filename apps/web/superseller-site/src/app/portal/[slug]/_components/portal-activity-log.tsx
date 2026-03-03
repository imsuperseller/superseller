'use client';

import { Activity } from 'lucide-react';

export interface ActivityLogEntry {
    id: string;
    message: string;
    time: string;
    type: 'system' | 'action' | 'success' | 'error';
}

const TYPE_COLORS: Record<string, string> = {
    system: 'bg-white/40',
    action: 'bg-blue-400',
    success: 'bg-green-400',
    error: 'bg-red-400',
};

export function PortalActivityLog({ entries }: { entries: ActivityLogEntry[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-white/50" />
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            {entries.length === 0 ? (
                <p className="text-sm text-white/40">No recent activity.</p>
            ) : (
                <div className="max-h-[300px] space-y-0 overflow-y-auto">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
                        >
                            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[entry.type] || TYPE_COLORS.system}`} />
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-sm font-medium leading-tight text-white/80">{entry.message}</p>
                                <p className="text-xs text-white/40">{entry.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
