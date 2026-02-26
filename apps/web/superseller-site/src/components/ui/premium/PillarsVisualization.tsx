'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, MessageSquare, Workflow, Users, Zap } from 'lucide-react';

const pillars = [
    {
        name: 'The Lead Machine',
        icon: Target,
        color: 'cyan',
        description: 'Outbound & Prospecting Engine'
    },
    {
        name: 'Voice AI Agent',
        icon: MessageSquare,
        color: 'purple',
        description: 'Sales & Appointment Management'
    },
    {
        name: 'Knowledge Engine',
        icon: Workflow,
        color: 'blue',
        description: 'Private Team Intelligence System'
    },
    {
        name: 'The Content Engine',
        icon: Users,
        color: 'rose',
        description: 'Autonomous Traffic Generation'
    }
];

export function PillarsVisualization() {
    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Background Glows */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Main Container */}
            <div className="relative z-10 w-full h-full rounded-[4rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-center p-8 md:p-12 overflow-hidden group">
                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center z-20">
                    <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
                    <Zap className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>

                {/* The 4 Pillars Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-8 w-full h-full">
                    {pillars.map((pillar, i) => {
                        const Icon = pillar.icon;
                        const colors = {
                            cyan: 'group-hover:text-cyan-400 bg-cyan-500/5 border-cyan-500/20',
                            purple: 'group-hover:text-purple-400 bg-purple-500/5 border-purple-500/20',
                            blue: 'group-hover:text-blue-400 bg-blue-500/5 border-blue-500/20',
                            rose: 'group-hover:text-rose-400 bg-rose-500/5 border-rose-500/20'
                        };

                        return (
                            <motion.div
                                key={pillar.name}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className={`aspect-square rounded-3xl md:rounded-[2.5rem] border flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-500 group/item ${colors[pillar.color as keyof typeof colors]}`}
                            >
                                <Icon className="w-8 h-8 md:w-12 md:h-12 text-white/20 group-hover/item:text-inherit transition-all duration-500 mb-4" />
                                <div className="text-center">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/item:text-white transition-colors mb-1 whitespace-nowrap">
                                        {pillar.name}
                                    </p>
                                    <p className="hidden md:block text-[8px] font-bold text-slate-600 group-hover/item:text-slate-400 transition-colors uppercase">
                                        {pillar.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Connecting Lines (Decorative) */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
                </div>
            </div>
        </div>
    );
}
