'use client';

import React, { useState } from 'react';
import {
    Users,
    Mail,
    Phone,
    Globe,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Download,
    Send,
    Sparkles,
    Lock,
    ArrowRight,
    Code,
    Loader2,
    PlusCircle,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface Lead {
    id: string;
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    website?: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'lost';
    createdAt: string;
    notes?: string;
}

interface LeadsTabProps {
    leads: Lead[];
    isFreeTrialUser: boolean;
    freeLeadsRemaining?: number;
    onUpgradeClick: () => void;
}

export default function LeadsTab({
    leads,
    isFreeTrialUser,
    freeLeadsRemaining = 0,
    onUpgradeClick
}: LeadsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deliveryMode, setDeliveryMode] = useState<'email' | 'crm'>('email');
    const [loadingExpert, setLoadingExpert] = useState(false);
    const [loadingPack, setLoadingPack] = useState<string | null>(null);

    const handleBuyPack = async (packId: string) => {
        setLoadingPack(packId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'lead-pack',
                    productId: packId,
                    tier: 'standard'
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Lead pack checkout error:', error);
        } finally {
            setLoadingPack(null);
        }
    };

    const handleExpertSetup = async () => {
        setLoadingExpert(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'service-purchase',
                    productId: 'crm-setup',
                    tier: 'standard'
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setLoadingExpert(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const leadName = lead.name || 'Anonymous';
        const matchesSearch = leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return '#1eaef7';
            case 'contacted': return '#f7931e';
            case 'qualified': return '#5ffbfd';
            case 'quoted': return '#a855f7'; // Purple for quote sent
            case 'converted': return '#22c55e';
            case 'lost': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const statusCounts = {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified' || (l as any).status === 'responded').length,
        converted: leads.filter(l => l.status === 'converted').length,
    };

    return (
        <div className="space-y-6">
            {/* Credit Status / Top Up Banner */}
            <div className={`rounded-xl p-6 border relative overflow-hidden ${isFreeTrialUser
                ? 'border-superseller-red/30 bg-gradient-to-br from-superseller-red/10 to-superseller-orange/10'
                : 'border-superseller-cyan/30 bg-gradient-to-br from-superseller-cyan/10 to-superseller-blue/10'
                }`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className={`w-20 h-20 ${isFreeTrialUser ? 'text-superseller-red' : 'text-superseller-cyan'}`} />
                </div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {isFreeTrialUser ? 'Free Trial' : 'Active Credits'}: {freeLeadsRemaining} leads remaining
                        </h3>
                        <p className="text-gray-400">
                            {isFreeTrialUser
                                ? 'Unlock unlimited leads + automated outreach with the Leads Pillar'
                                : 'Leads are automatically verified and enriched before delivery.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isFreeTrialUser ? (
                            <Button
                                onClick={onUpgradeClick}
                                className="bg-gradient-to-r from-superseller-red to-superseller-orange hover:brightness-110 text-white font-bold px-6 border-0"
                            >
                                Upgrade Now
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="bg-superseller-cyan hover:bg-superseller-cyan/90 text-black font-bold px-6 border-0"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Buy More Leads
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-superseller-bg-secondary border-white/10 w-56">
                                    <DropdownMenuLabel className="text-gray-400">Select Pack Size</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem
                                        onClick={() => handleBuyPack('lead-pack-starter')}
                                        className="flex justify-between items-center py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                    >
                                        <span className="text-white font-medium">Starter (50)</span>
                                        <span className="text-superseller-cyan font-bold">$149</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBuyPack('lead-pack-growth')}
                                        className="flex justify-between items-center py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                    >
                                        <span className="text-white font-medium">Growth (100)</span>
                                        <span className="text-superseller-cyan font-bold">$249</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBuyPack('lead-pack-scale')}
                                        className="flex justify-between items-center py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                    >
                                        <span className="text-white font-medium">Scale (500)</span>
                                        <span className="text-superseller-cyan font-bold">$999</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Lead Delivery Preferences */}
            {!isFreeTrialUser && (
                <div className="superseller-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Send className="w-5 h-5 text-superseller-cyan" />
                                Lead Delivery Preferences
                            </h3>
                            <p className="text-sm text-gray-400">Choose how you want to receive your leads</p>
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setDeliveryMode('email')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${deliveryMode === 'email'
                                    ? 'bg-superseller-cyan/20 text-superseller-cyan'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Email Delivery
                            </button>
                            <button
                                onClick={() => setDeliveryMode('crm')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${deliveryMode === 'crm'
                                    ? 'bg-superseller-cyan/20 text-superseller-cyan'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                CRM Integration
                            </button>
                        </div>
                    </div>

                    {deliveryMode === 'email' ? (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-superseller-blue/20 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-superseller-blue" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Active: Email Notifications</h4>
                                <p className="text-sm text-gray-400 mb-2">
                                    Leads are sent instantly to your registered email address.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-green-500">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* DIY Option */}
                            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-gray-400" />
                                    DIY Webhook
                                </h4>
                                <p className="text-sm text-gray-400 mb-4">
                                    Connect your CRM (HubSpot, Salesforce, GoHighLevel) via webhook.
                                </p>
                                <div className="bg-black/40 p-3 rounded border border-white/10 mb-4 font-mono text-xs text-gray-500 break-all">
                                    https://api.superseller.agency/v1/hooks/leads/your-id-key
                                </div>
                                <Button variant="outline" size="sm" className="w-full border-white/20 text-gray-300">
                                    Copy Webhook URL
                                </Button>
                            </div>

                            {/* Expert Setup Option */}
                            <div className="bg-gradient-to-br from-superseller-cyan/10 to-superseller-blue/5 rounded-lg p-5 border border-superseller-cyan/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-superseller-cyan" />
                                        Expert Setup
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-4">
                                        We configure the connection, map fields, and test data flow for you.
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xl font-bold text-white">$297 <span className="text-sm font-normal text-gray-400">one-time</span></span>
                                        <Button
                                            onClick={handleExpertSetup}
                                            disabled={loadingExpert}
                                            className="bg-superseller-cyan hover:bg-superseller-cyan/90 text-black font-bold h-9 border-0"
                                        >
                                            {loadingExpert ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Hire an Expert'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                        key={status}
                        className="superseller-card p-4"
                    >
                        <div
                            className="text-2xl font-bold mb-1"
                            style={{ color: getStatusColor(status) }}
                        >
                            {count}
                        </div>
                        <div className="text-sm text-gray-400 capitalize">{status}</div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="superseller-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-superseller-cyan/50 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'new', 'contacted', 'qualified', 'converted'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${statusFilter === status
                                ? 'bg-superseller-cyan/20 text-superseller-cyan border border-superseller-cyan'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads List */}
            <div className="superseller-card p-0 overflow-hidden">
                {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead, index) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between p-4 border-b border-superseller-bg-secondary last:border-b-0 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: getStatusColor(lead.status) + '30' }}
                                >
                                    {(lead.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{lead.name || 'Anonymous Lead'}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        {lead.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {lead.email}
                                            </span>
                                        )}
                                        {lead.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {lead.phone}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {lead.source}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                    style={{
                                        backgroundColor: getStatusColor(lead.status) + '20',
                                        color: getStatusColor(lead.status)
                                    }}
                                >
                                    {lead.status}
                                </span>
                                {/* Action buttons - locked for free trial beyond first 3 */}
                                {isFreeTrialUser && index >= 3 ? (
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs">Upgrade to contact</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-superseller-cyan hover:bg-superseller-cyan/10"
                                    >
                                        <Send className="w-4 h-4 mr-1" />
                                        Contact
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">No leads found</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchQuery ? 'Try a different search term' : 'Submit a niche to generate leads'}
                        </p>
                    </div>
                )}
            </div>

            {/* Export Button (locked for free trial) */}
            {
                leads.length > 0 && (
                    <div className="flex justify-end">
                        {isFreeTrialUser ? (
                            <Button
                                variant="ghost"
                                className="text-gray-500"
                                disabled
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Export (Upgrade to unlock)
                            </Button>
                        ) : (
                            <Button variant="supersellerSecondary">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        )}
                    </div>
                )
            }
        </div>
    );
}
