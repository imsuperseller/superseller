import React from 'react';
import { SuperSeller AICard } from '@/components/ui/superseller-card';

interface AgentOutputDisplayProps {
  customerId: string;
  agentType: string;
}

export function AgentOutputDisplay({ customerId, agentType }: AgentOutputDisplayProps) {
  const sampleOutputs: Record<string, Record<string, string[]>> = {
    'test-customer': {
      'content-strategy': ['Marketing Roadmap 2024', 'Brand Voice Guide'],
      'lead-audit': ['Conversion Analysis', 'Optimization Plan'],
      'system-architecture': ['Integration Map', 'Security Protocol']
    }
  };

  const outputs = sampleOutputs[customerId as keyof typeof sampleOutputs]?.[agentType] || [];

  return (
    <SuperSeller AICard variant="gradient">
      <h3 className="text-xl font-semibold text-superseller-cyan capitalize">
        {agentType.replace('-', ' ')} Outputs
      </h3>
      <div className="space-y-2 mt-4">
        {outputs.map((output, index) => (
          <div key={index} className="p-3 bg-superseller-bg-secondary rounded-lg">
            <p className="font-medium">{output}</p>
            <p className="text-sm text-superseller-text-muted">Status: Completed</p>
          </div>
        ))}
      </div>
    </SuperSeller AICard>
  );
}
