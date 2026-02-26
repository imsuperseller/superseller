'use client';

import {
  Home,
  KeyRound,
  UtensilsCrossed,
  HardHat,
  Wrench,
  Flame,
  ShieldCheck,
  Stethoscope,
  type LucideProps,
} from 'lucide-react';
import type { NicheIconName } from '@/data/niches';

const ICON_MAP: Record<NicheIconName, React.ComponentType<LucideProps>> = {
  Home,
  KeyRound,
  UtensilsCrossed,
  HardHat,
  Wrench,
  Flame,
  ShieldCheck,
  Stethoscope,
};

interface NicheIconProps extends LucideProps {
  name: NicheIconName;
}

export function NicheIcon({ name, ...props }: NicheIconProps) {
  const Icon = ICON_MAP[name];
  return <Icon {...props} />;
}
