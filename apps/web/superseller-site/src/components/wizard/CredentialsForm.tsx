'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Switch } from '@/components/ui/switch-enhanced';
import { Lock, Key, Database } from 'lucide-react';

interface CredentialsFormProps {
    data: any;
    onUpdate: (data: any) => void;
}

export function CredentialsForm({ data, onUpdate }: CredentialsFormProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Secure Credentials</h2>
                <p className="text-gray-400">Your keys are encrypted and stored in our secure vault.</p>
            </div>

            <div className="space-y-6">
                {/* OpenAI Key */}
                <Card variant="superseller" className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                    <Key size={20} />
                                </div>
                                <h3 className="font-semibold text-white">OpenAI API Key</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-400 font-normal">Use SuperSeller AI&apos;s Key (+$20/mo)</Label>
                                <Switch
                                    checked={data.useSuperSeller AIOpenai || false}
                                    onCheckedChange={(c) => onUpdate({ ...data, useSuperSeller AIOpenai: c })}
                                />
                            </div>
                        </div>

                        {!data.useSuperSeller AIOpenai && (
                            <div className="space-y-3">
                                <Label className="text-white">API Key (sk-...)</Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={data.openaiKey || ''}
                                        onChange={(e) => onUpdate({ ...data, openaiKey: e.target.value })}
                                        placeholder="sk-..."
                                        className="bg-black/20 border-white/10 pl-10 !text-white placeholder:text-gray-500"
                                    />
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CRM Key */}
                <Card variant="superseller" className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <Database size={20} />
                            </div>
                            <h3 className="font-semibold text-white">CRM API Access</h3>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white">API Token / Key</Label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    value={data.crmKey || ''}
                                    onChange={(e) => onUpdate({ ...data, crmKey: e.target.value })}
                                    placeholder="Enter your CRM API Key"
                                    className="bg-black/20 border-white/10 pl-10 !text-white placeholder:text-gray-500"
                                />
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500">
                                For ServiceTitan: You must create a new API application in Settings with &apos;Read/Write&apos; access.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Lock size={12} /> Data is end-to-end encrypted via AES-256 before storage.
                </p>
            </div>
        </div>
    );
}
