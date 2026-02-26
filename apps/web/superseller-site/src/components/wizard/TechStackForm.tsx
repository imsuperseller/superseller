'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Switch } from '@/components/ui/switch-enhanced';
import { Check, Database, Phone, MessageSquare } from 'lucide-react';

interface TechStackFormProps {
    data: any;
    onUpdate: (data: any) => void;
}

const CRM_OPTIONS = [
    { id: 'servicetitan', name: 'ServiceTitan', icon: '🔧' },
    { id: 'jobber', name: 'Jobber', icon: '📅' },
    { id: 'housecallpro', name: 'Housecall Pro', icon: '🏠' },
    { id: 'salesforce', name: 'Salesforce', icon: '☁️' },
    { id: 'hubspot', name: 'HubSpot', icon: '🟠' },
    { id: 'custom', name: 'Other / Custom', icon: '⚡' },
];

export function TechStackForm({ data, onUpdate }: TechStackFormProps) {
    const selectedCrm = data.crm || '';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your Tech Stack</h2>
                <p className="text-gray-400">Select the tools you use so we can connect them.</p>
            </div>

            {/* CRM Selection */}
            <div className="space-y-4">
                <Label>Primary CRM / Database</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {CRM_OPTIONS.map((crm) => {
                        const isSelected = selectedCrm === crm.id;
                        return (
                            <div
                                key={crm.id}
                                onClick={() => onUpdate({ ...data, crm: crm.id })}
                                className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-300 group hover:scale-[1.02] ${isSelected
                                    ? 'bg-[rgba(30,174,247,0.1)] border-[var(--superseller-cyan)] shadow-[0_0_15px_rgba(30,174,247,0.2)]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-[var(--superseller-cyan)] rounded-full p-0.5">
                                            <Check size={12} className="text-black" />
                                        </div>
                                    </div>
                                )}
                                <div className="text-3xl mb-3 text-center group-hover:scale-110 transition-transform duration-300">
                                    {crm.icon}
                                </div>
                                <div className={`text-center font-medium ${isSelected ? 'text-[var(--superseller-cyan)]' : 'text-gray-300'}`}>
                                    {crm.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Logic for selected CRM */}
            {selectedCrm === 'custom' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200">
                    For custom CRMs, we will need to schedule a brief mapping call after onboarding.
                </div>
            )}

            {/* Communication Channels */}
            <div className="space-y-6">
                <Label>Communication Channels</Label>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card variant="superseller" className="bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h3 className="font-semibold text-white">WhatsApp</h3>
                                </div>
                                <Switch
                                    checked={data.useWhatsapp || false}
                                    onCheckedChange={(c) => onUpdate({ ...data, useWhatsapp: c })}
                                />
                            </div>

                            {data.useWhatsapp && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-white">WhatsApp Number</Label>
                                    <Input
                                        value={data.whatsappPhone || ''}
                                        onChange={(e) => onUpdate({ ...data, whatsappPhone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                    <p className="text-xs text-gray-400">
                                        You will scan a QR code to connect this later.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card variant="superseller" className="bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                        <Phone size={20} />
                                    </div>
                                    <h3 className="font-semibold text-white">SMS / Voice</h3>
                                </div>
                                <Switch
                                    checked={data.useSms || false}
                                    onCheckedChange={(c) => onUpdate({ ...data, useSms: c })}
                                />
                            </div>

                            {data.useSms && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">Provider</Label>
                                        <div className="flex gap-2">
                                            {['Twilio', 'Retell', 'Other'].map(p => (
                                                <div
                                                    key={p}
                                                    onClick={() => onUpdate({ ...data, smsProvider: p })}
                                                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm border transition-colors ${(data.smsProvider || 'Twilio') === p
                                                            ? 'bg-[var(--superseller-cyan)] text-black border-[var(--superseller-cyan)] font-medium'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {p}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Phone Number</Label>
                                        <Input
                                            value={data.twilioPhone || ''}
                                            onChange={(e) => onUpdate({ ...data, twilioPhone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
