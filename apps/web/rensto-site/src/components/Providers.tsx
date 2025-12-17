import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      {children}
    </>
  );
}
