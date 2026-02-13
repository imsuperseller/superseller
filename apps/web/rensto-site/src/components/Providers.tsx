'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {mounted && <Toaster position="top-center" richColors theme="dark" />}
      {children}
    </>
  );
}
