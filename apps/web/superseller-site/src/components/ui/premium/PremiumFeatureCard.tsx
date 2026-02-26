'use client';

import React from 'react';
import * as framer from 'framer-motion';
const { motion } = framer;
import { CheckCircle2, Cpu } from 'lucide-react';

export function PremiumFeatureCard({ title, desc, idx }: { title: string, desc: string, idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
            className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-500 flex items-start gap-8"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 relative z-10">
                <h4 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h4>
                <p className="text-base text-slate-500 font-bold tracking-wide leading-relaxed group-hover:text-slate-400 transition-colors uppercase text-[12px] flex items-center gap-3">
                    <span className="w-4 h-[2px] bg-cyan-500/30" />
                    {desc}
                </p>
            </div>
            <div className="absolute right-10 bottom-10 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                <Cpu className="w-24 h-24 text-white" />
            </div>
        </motion.div>
    );
}
