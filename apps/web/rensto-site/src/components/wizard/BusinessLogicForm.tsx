'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Textarea } from '@/components/ui/textarea-enhanced';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';

interface BusinessLogicFormProps {
    data: any;
    onUpdate: (data: any) => void;
}

export function BusinessLogicForm({ data, onUpdate }: BusinessLogicFormProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Automated Rules</h2>
                <p className="text-gray-400">Tell the AI how to handle specific situations.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* After Hours Logic */}
                <Card variant="rensto" className="bg-white/5 border-white/10 md:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-semibold text-white">After-Hours Response</h3>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white">What should the AI text back when you are closed?</Label>
                            <Textarea
                                value={data.afterHoursMsg || ''}
                                onChange={(e) => onUpdate({ ...data, afterHoursMsg: e.target.value })}
                                placeholder="e.g. Thanks for calling! We are closed but will call you back at 8 AM tomorrow."
                                className="bg-black/20 border-white/10 min-h-[100px] text-white placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-500">This variable will be injected into the &apos;Missed Call&apos; workflow.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Qualification Logic */}
                <Card variant="rensto" className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-semibold text-white">Job Qualification</h3>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white">Minimum Job Size ($)</Label>
                            <Input
                                type="number"
                                value={data.minJobSize || ''}
                                onChange={(e) => onUpdate({ ...data, minJobSize: e.target.value })}
                                placeholder="e.g. 150"
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-500">Leads below this amount will be flagged as &apos;Low Priority&apos;.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Logic */}
                <Card variant="rensto" className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="font-semibold text-white">Emergency Alerts</h3>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-white">Who gets the &apos;Emergency&apos; SMS?</Label>
                            <Input
                                value={data.emergencyPhone || ''}
                                onChange={(e) => onUpdate({ ...data, emergencyPhone: e.target.value })}
                                placeholder="+1 (555) 911-9111"
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                            />
                            <p className="text-xs text-gray-500">Used for triage workflow (e.g. &apos;Water leak&apos;).</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
