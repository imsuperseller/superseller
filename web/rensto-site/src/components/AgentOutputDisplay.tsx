
import React from 'react';
import { RenstoCard } from '@/components/ui/rensto-card';

export function AgentOutputDisplay({ customerId, agentType }) {
  const sampleOutputs = {
    'ben-ginati': {
      wordpress: ['Tax Season Blog Post', 'SEO Optimization Report'],
      social: ['Tax Tips Tuesday Post', 'LinkedIn Article'],
      podcast: ['Tax Planning Episode', 'Show Notes']
    },
    'shelly-mizrahi': {
      excel: ['Customer Analysis Report', 'Q4 Performance Data'],
      data: ['Retention Analysis', 'Trend Report']
    }
  };

  const outputs = sampleOutputs[customerId]?.[agentType] || [];

  return (
    <RenstoCard variant="gradient">
      <h3 className="text-xl font-semibold text-rensto-cyan capitalize">
        {agentType.replace('-', ' ')} Outputs
      </h3>
      <div className="space-y-2 mt-4">
        {outputs.map((output, index) => (
          <div key={index} className="p-3 bg-rensto-bg-secondary rounded-lg">
            <p className="font-medium">{output}</p>
            <p className="text-sm text-rensto-text-muted">Status: Completed</p>
          </div>
        ))}
      </div>
    </RenstoCard>
  );
}
