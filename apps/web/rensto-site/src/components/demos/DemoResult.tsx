'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DemoResultProps {
    title: string;
    data: any;
    status?: string;
    isLoading?: boolean;
    className?: string;
}

export function DemoResult({
    title,
    data,
    status = "Active",
    isLoading,
    className
}: DemoResultProps) {
    if (isLoading) {
        return (
            <Card className={cn("border-cyan-500/10 animate-pulse", className)}>
                <CardContent className="h-48 flex items-center justify-center">
                    <div className="text-muted-foreground font-mono uppercase tracking-tighter">Processing Data...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-cyan-500/10 bg-muted/20 overflow-hidden", className)}>
            <CardHeader className="bg-muted/30 border-b border-cyan-500/10 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold font-mono uppercase tracking-widest text-cyan-400">
                    {title}
                </CardTitle>
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5 font-mono text-[10px]">
                    {status}
                </Badge>
            </CardHeader>
            <CardContent className="p-4">
                <div className="bg-black/40 rounded p-3 font-mono text-xs text-cyan-300/80 border border-cyan-500/5 max-h-[200px] overflow-auto custom-scrollbar">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            </CardContent>
        </Card>
    );
}
