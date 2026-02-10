'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Shield,
    Users,
    Workflow,
    Database,
    Activity,
    Box,
    Cpu,
    ChevronRight,
    Search,
    Info
} from 'lucide-react';

interface Node {
    id: string;
    type: 'pillar' | 'product' | 'agent';
    label: string;
    status: 'active' | 'beta' | 'error' | 'idle';
    icon: any;
    parentId?: string;
    data?: any;
}

interface EcosystemMapProps {
    products: any[];
}

export default function EcosystemMap({ products: initialAITableProducts }: EcosystemMapProps) {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Build the hierarchy from AITable Products
    const pillars: Node[] = [
        { id: 'lead-machine', type: 'pillar', label: 'Lead Extraction', status: 'active', icon: Search },
        { id: 'autonomous-secretary', type: 'pillar', label: 'Communication', status: 'active', icon: Users },
        { id: 'knowledge-engine', type: 'pillar', label: 'Intelligence', status: 'active', icon: Database },
        { id: 'content-engine', type: 'pillar', label: 'Media Force', status: 'active', icon: Workflow },
    ];

    const products: Node[] = initialAITableProducts.map(p => {
        const status = p.Status === 'active' || p.status === 'active' ? 'active' : 'beta';
        return {
            id: p['Product ID'] || p.id,
            type: 'product' as const,
            label: p['Product Name'] || p.name,
            status: status as 'active' | 'beta' | 'error' | 'idle',
            icon: Box,
            parentId: p['pillarId'] || p.pillarId,
            data: p
        };
    }).filter(p => p.parentId); // Only show those assigned to a pillar

    // Mock Agents for visualization (In real life these come from Firestore/n8n)
    const agents: Node[] = [
        { id: 'agent-1', type: 'agent', label: 'Abraham-Worker-01', status: 'active', icon: Cpu, parentId: 'lead-machine' },
        { id: 'agent-2', type: 'agent', label: 'Abraham-Worker-02', status: 'active', icon: Cpu, parentId: 'lead-machine' },
        { id: 'agent-3', type: 'agent', label: 'Sarah-Comms-TX', status: 'idle', icon: Cpu, parentId: 'autonomous-secretary' },
    ];

    const renderNode = (node: Node, x: number, y: number) => {
        const isSelected = selectedNode?.id === node.id;

        return (
            <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute cursor-pointer p-4 rounded-2xl border transition-all z-10 w-48
                    ${node.type === 'pillar' ? 'bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' :
                        node.type === 'product' ? 'bg-[#fe3d51]/5 border-[#fe3d51]/20' :
                            'bg-white/5 border-white/10'}
                    ${isSelected ? 'ring-2 ring-white/50 border-white/40' : ''}
                `}
                style={{ left: x, top: y }}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${node.type === 'pillar' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/70'}`}>
                        <node.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">
                            {node.type}
                        </p>
                        <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">
                            {node.label}
                        </h4>
                    </div>
                    {node.status === 'active' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-[700px] bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="absolute top-8 left-8 z-20">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Neural Hierarchy Map</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Worker Grid Clusters</p>
            </div>

            {/* The SVG Plane for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            </svg>

            <div className="relative w-full h-full flex items-center justify-between px-12 overflow-x-auto scrollbar-hide">
                {/* Pillar Column */}
                <div className="flex flex-col gap-8 py-20">
                    {pillars.map((p, i) => (
                        <div key={p.id} className="relative w-52 h-20">
                            {renderNode(p, 0, 0)}
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex justify-center translate-x-12">
                    <ChevronRight className="w-8 h-8 text-white/10" />
                </div>

                {/* Product Column */}
                <div className="flex flex-col gap-6 py-20 max-h-full overflow-y-auto pr-8">
                    {products.map((p, i) => (
                        <div key={p.id} className="relative w-52 h-20">
                            {renderNode(p, 0, 0)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Panel (Sidebar) */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        className="absolute right-0 top-0 bottom-0 w-80 bg-[#0d0d0d] border-l border-white/10 p-8 z-30 shadow-2xl backdrop-blur-3xl"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <selectedNode.icon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-slate-500 hover:text-white"
                            >
                                <Zap className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">{selectedNode.type} profile</p>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{selectedNode.label}</h2>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Status</span>
                                    <span className="text-green-400">{selectedNode.status.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Node ID</span>
                                    <span className="text-slate-300 font-mono">{selectedNode.id.slice(0, 12)}</span>
                                </div>
                            </div>

                            {selectedNode.data && (
                                <div className="pt-6 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Metrics</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Uptime</p>
                                            <p className="text-sm font-black text-white">99.8%</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Load</p>
                                            <p className="text-sm font-black text-white">12%</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                        "{selectedNode.data.headline || 'System Operational'}"
                                    </p>
                                </div>
                            )}

                            <div className="pt-8">
                                <button className="w-full h-14 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                                    Access Terminal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
