'use client';

import { CrewMemberCard } from './CrewMemberCard';
import { CREW_MEMBERS } from '@/data/crew';
import type { CrewMember } from '@/data/crew';

interface CrewGridProps {
  members?: CrewMember[];
  className?: string;
}

export function CrewGrid({ members, className = '' }: CrewGridProps) {
  const items = members ?? CREW_MEMBERS;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {items.map((member, i) => (
        <CrewMemberCard key={member.id} member={member} index={i} />
      ))}
    </div>
  );
}
