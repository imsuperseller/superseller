'use client';

import { useEffect, useState } from 'react';

/** Renders children only after mount. Use for components that cause hydration mismatch. */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
