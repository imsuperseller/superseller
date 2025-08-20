
import React from 'react';
import { RenstoCard } from '@/components/ui/rensto-card';

export function MCPToolStatus({ customerId, tools }) {
  return (
    <RenstoCard variant="rensto">
      <h3 className="text-xl font-semibold text-rensto-cyan">MCP Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {tools.map((tool) => (
          <div key={tool} className="p-3 bg-rensto-bg-secondary rounded-lg">
            <h4 className="font-medium capitalize">{tool.replace('-', ' ')}</h4>
            <p className="text-sm text-rensto-text-muted">Status: Active</p>
          </div>
        ))}
      </div>
    </RenstoCard>
  );
}
