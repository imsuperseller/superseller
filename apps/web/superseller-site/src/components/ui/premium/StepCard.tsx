'use client';

import React from 'react';
import * as framer from 'framer-motion';
const { motion } = framer;

export function StepCard({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative p-10 rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.1] backdrop-blur-2xl group transition-all duration-700 overflow-hidden shadow-2xl"
        >
            <div className="absolute -right-6 -top-6 text-9xl font-black text-white/[0.03] group-hover:text-cyan-500/[0.08] transition-all duration-700 select-none italic tracking-tighter">
                {number}
            </div>
            <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/20 transition-all duration-500 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    <Icon className="w-10 h-10 text-cyan-400 group-hover:scale-125 transition-transform" />
                </div>
                <h4 className="font-black text-2xl mb-4 text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase italic">{title}</h4>
                <p className="text-base text-slate-400 leading-relaxed font-semibold opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
        </motion.div>
    );
}
