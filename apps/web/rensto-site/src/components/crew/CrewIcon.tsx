'use client';

import {
  Video,
  Mic,
  Phone,
  Target,
  Share2,
  Brain,
  ShoppingBag,
  type LucideProps,
} from 'lucide-react';
import type { CrewIconName } from '@/data/crew';

const ICON_MAP: Record<CrewIconName, React.ComponentType<LucideProps>> = {
  Video,
  Mic,
  Phone,
  Target,
  Share2,
  Brain,
  ShoppingBag,
};

interface CrewIconProps extends LucideProps {
  name: CrewIconName;
}

export function CrewIcon({ name, ...props }: CrewIconProps) {
  const Icon = ICON_MAP[name];
  return <Icon {...props} />;
}
