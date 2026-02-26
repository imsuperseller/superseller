
import React from 'react';
import { SuperSellerCard } from '@/components/ui/superseller-card';

export function MCPToolStatus({ customerId, tools }) {
  return (
    <SuperSellerCard variant="superseller">
      <h3 className="text-xl font-semibold text-superseller-cyan">MCP Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {tools.map((tool) => (
          <div key={tool} className="p-3 bg-superseller-bg-secondary rounded-lg">
            <h4 className="font-medium capitalize">{tool.replace('-', ' ')}</h4>
            <p className="text-sm text-superseller-text-muted">Status: Active</p>
          </div>
        ))}
      </div>
    </SuperSellerCard>
  );
}
