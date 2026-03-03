'use client';

import { useEffect } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';
import { Users, Video, Share2, Phone, Zap, BarChart3, Target, TrendingUp } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
    users: Users,
    video: Video,
    share: Share2,
    phone: Phone,
    zap: Zap,
    chart: BarChart3,
    target: Target,
    trending: TrendingUp,
};

export interface StatCardConfig {
    label: string;
    value: number | string;
    icon: string;
    color?: string; // tailwind color class like 'orange' | 'teal' | 'blue' | 'green' | 'red'
    progress?: number; // 0-100
}

function AnimatedNumber({ value }: { value: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
        return controls.stop;
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
}

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', iconBg: 'bg-orange-500/20' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', iconBg: 'bg-teal-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', iconBg: 'bg-green-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', iconBg: 'bg-red-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
};

export function PortalStatsCards({ stats }: { stats: StatCardConfig[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
                <PortalStatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}

function PortalStatCard({ label, value, icon, color = 'orange', progress }: StatCardConfig) {
    const Icon = ICON_MAP[icon] || BarChart3;
    const colors = COLOR_MAP[color] || COLOR_MAP.orange;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colors.iconBg}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
            </p>
            {progress !== undefined && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--tenant-primary,#f47920)] to-[var(--tenant-accent,#4ecdc4)] transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
