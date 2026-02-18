'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    MessageSquare,
    Plus,
    Edit2,
    Trash2,
    Shield,
    Eye,
    EyeOff,
    Globe,
    CheckCircle2,
    XCircle,
    Save,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { Client, Testimonial } from '@/types/legacy-types';
import { toast } from 'sonner';

export default function ClientManagement() {
    const [clients, setClients] = useState<Client[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'clients' | 'testimonials'>('clients');

    // Modals
    const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsRes, testimonialsRes] = await Promise.all([
                fetch('/api/admin/clients'),
                fetch('/api/admin/testimonials')
            ]);

            if (clientsRes.ok && testimonialsRes.ok) {
                const clientsData = await clientsRes.json();
                const testimonialsData = await testimonialsRes.json();
                setClients(clientsData.clients || []);
                setTestimonials(testimonialsData.testimonials || []);
            }
        } catch (error) {
            console.error('Failed to fetch client data', error);
            toast.error('Failed to load data shadow');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClient = async () => {
        if (!editingClient?.name) return;
        setIsSaving(true);
        try {
            const method = editingClient.id ? 'PATCH' : 'POST';
            const res = await fetch('/api/admin/clients', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingClient)
            });

            if (res.ok) {
                toast.success(editingClient.id ? 'Core database updated' : 'New entity registered');
                setEditingClient(null);
                fetchData();
            }
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTestimonial = async () => {
        if (!editingTestimonial?.author) return;
        setIsSaving(true);
        try {
            const method = editingTestimonial.id ? 'PATCH' : 'POST';
            const res = await fetch('/api/admin/testimonials', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTestimonial)
            });

            if (res.ok) {
                toast.success('Testimonial database synchronized');
                setEditingTestimonial(null);
                fetchData();
            }
        } catch (error) {
            toast.error('Database update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (type: 'clients' | 'testimonials', id: string) => {
        if (!confirm('Are you sure you want to purge this record?')) return;
        try {
            const res = await fetch(`/api/admin/${type}?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Record purged successfully');
                fetchData();
            }
        } catch (error) {
            toast.error('Purge failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Scanning Firestore Segments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Client Intelligence</h2>
                    <p className="text-slate-400 font-medium">Control landing page entities, logos, and testimonials.</p>
                </div>
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'clients' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Core Entities</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('testimonials')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'testimonials' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Public Praise</span>
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end">
                <button
                    onClick={() => activeTab === 'clients' ? setEditingClient({ status: 'active', showLogoOnLanding: true, privacySettings: { hideBusinessName: false } }) : setEditingTestimonial({ isActive: true, language: 'en', order: 0 })}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" />
                    <span>Register New {activeTab === 'clients' ? 'Entity' : 'Testimonial'}</span>
                </button>
            </div>

            {/* Content List */}
            {activeTab === 'clients' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                        <div key={client.id} className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden flex flex-col">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl p-3 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all">
                                    {client.logoUrl ? (
                                        <img src={client.logoUrl} alt={client.name} className="max-w-full max-h-full object-contain filter brightness-90 group-hover:brightness-100" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-slate-600" />
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditingClient(client)}
                                        className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete('clients', client.id)}
                                        className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-[#fe3d51] hover:bg-[#fe3d51]/10 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="text-xl font-black text-white tracking-tight">{client.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{client.hebrew.name}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {client.status === 'active' ? (
                                        <span className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Active</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1 px-3 py-1 bg-slate-500/10 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-500/20">
                                            <XCircle className="w-3 h-3" />
                                            <span>Inactive</span>
                                        </span>
                                    )}
                                    {client.showLogoOnLanding && (
                                        <span className="flex items-center space-x-1 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">
                                            <Eye className="w-3 h-3" />
                                            <span>Public Logo</span>
                                        </span>
                                    )}
                                    {client.privacySettings.hideBusinessName && (
                                        <span className="flex items-center space-x-1 px-3 py-1 bg-[#fe3d51]/10 text-[#fe3d51] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#fe3d51]/20">
                                            <Shield className="w-3 h-3" />
                                            <span>Obfuscated</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="group relative p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-8">
                            <div className="flex-shrink-0 w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 overflow-hidden relative">
                                {testimonial.imageUrl ? (
                                    <img src={testimonial.imageUrl} alt={testimonial.author} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-700 text-2xl uppercase">
                                        {testimonial.author?.[0]}
                                    </div>
                                )}
                                <div className={`absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center text-[10px] font-black uppercase ${testimonial.language === 'he' ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-white'}`}>
                                    {testimonial.language}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-4">
                                    <h4 className="text-lg font-black text-white tracking-tight">{testimonial.author}</h4>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{testimonial.role}</span>
                                    {testimonial.label && (
                                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                                            {testimonial.label}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-2 italic font-medium">&ldquo;{testimonial.quote}&rdquo;</p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingTestimonial(testimonial)}
                                    className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete('testimonials', testimonial.id)}
                                    className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-[#fe3d51] hover:bg-[#fe3d51]/10 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Modal */}
            {editingClient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                    <div className="bg-[#1a162f] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                    {editingClient.id ? 'Modify Entity' : 'Core Registration'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Firestore Record Management</p>
                            </div>
                            <button onClick={() => setEditingClient(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Name (EN)</label>
                                        <input
                                            type="text"
                                            value={editingClient.name || ''}
                                            onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Name (HE)</label>
                                        <input
                                            type="text"
                                            value={editingClient.hebrew?.name || ''}
                                            onChange={e => setEditingClient({ ...editingClient, hebrew: { ...editingClient.hebrew, name: e.target.value } as any })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white text-right focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                            dir="rtl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logo Image URL</label>
                                        <input
                                            type="text"
                                            value={editingClient.logoUrl || ''}
                                            onChange={e => setEditingClient({ ...editingClient, logoUrl: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Label (e.g. CLIENT)</label>
                                        <input
                                            type="text"
                                            value={editingClient.privacySettings?.customLabel || ''}
                                            onChange={e => setEditingClient({ ...editingClient, privacySettings: { ...editingClient.privacySettings, customLabel: e.target.value } as any })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-8 bg-white/[0.02] rounded-[2rem] border border-white/5">
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editingClient.status === 'active'}
                                        onChange={e => setEditingClient({ ...editingClient, status: e.target.checked ? 'active' : 'inactive' })}
                                        className="hidden"
                                    />
                                    <div className={`w-3 h-3 rounded-full mb-3 ${editingClient.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">System Active</span>
                                </label>
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editingClient.showLogoOnLanding}
                                        onChange={e => setEditingClient({ ...editingClient, showLogoOnLanding: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-3 h-3 rounded-full mb-3 ${editingClient.showLogoOnLanding ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-700'}`} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Public Landing</span>
                                </label>
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editingClient.privacySettings?.hideBusinessName}
                                        onChange={e => setEditingClient({ ...editingClient, privacySettings: { ...editingClient.privacySettings, hideBusinessName: e.target.checked } as any })}
                                        className="hidden"
                                    />
                                    <div className={`w-3 h-3 rounded-full mb-3 ${editingClient.privacySettings?.hideBusinessName ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-700'}`} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Obfuscate Name</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-black/20 flex gap-4">
                            <button
                                onClick={() => setEditingClient(null)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveClient}
                                disabled={isSaving}
                                className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
                            >
                                {isSaving ? 'Syncing...' : 'Synchronize Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonial Modal */}
            {editingTestimonial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                    <div className="bg-[#1a162f] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                    {editingTestimonial.id ? 'Refine Praise' : 'New Testimony'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Social Proof Logic Management</p>
                            </div>
                            <button onClick={() => setEditingTestimonial(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Author Name</label>
                                        <input
                                            type="text"
                                            value={editingTestimonial.author || ''}
                                            onChange={e => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Role / Position</label>
                                        <input
                                            type="text"
                                            value={editingTestimonial.role || ''}
                                            onChange={e => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Result Metric</label>
                                        <input
                                            type="text"
                                            value={editingTestimonial.result || ''}
                                            onChange={e => setEditingTestimonial({ ...editingTestimonial, result: e.target.value })}
                                            placeholder="e.g. +45% Workflow Efficiency"
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={editingTestimonial.imageUrl || ''}
                                            onChange={e => setEditingTestimonial({ ...editingTestimonial, imageUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Client Link (Entity ID)</label>
                                        <select
                                            value={editingTestimonial.clientId || ''}
                                            onChange={e => setEditingTestimonial({ ...editingTestimonial, clientId: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold appearance-none hover:bg-white/[0.07]"
                                        >
                                            <option value="">Select Entity...</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Language</label>
                                            <select
                                                value={editingTestimonial.language || 'en'}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, language: e.target.value as 'en' | 'he' })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold appearance-none ml-2"
                                            >
                                                <option value="en">English</option>
                                                <option value="he">Hebrew</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order</label>
                                            <input
                                                type="number"
                                                value={editingTestimonial.order || 0}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, order: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quote (Testimony Content)</label>
                                <textarea
                                    rows={4}
                                    value={editingTestimonial.quote || ''}
                                    onChange={e => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                                    className={`w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium italic ${editingTestimonial.language === 'he' ? 'text-right' : 'text-left'}`}
                                    dir={editingTestimonial.language === 'he' ? 'rtl' : 'ltr'}
                                />
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-black/20 flex gap-4">
                            <button
                                onClick={() => setEditingTestimonial(null)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTestimonial}
                                disabled={isSaving}
                                className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
                            >
                                {isSaving ? 'Syncing...' : 'Deploy Testimony'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
