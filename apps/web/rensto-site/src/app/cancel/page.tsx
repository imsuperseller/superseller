import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

interface CancelPageProps {
  searchParams: { canceled?: string };
}

export default function CancelPage({ searchParams }: CancelPageProps) {
  const canceled = searchParams?.canceled;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--rensto-bg-primary)' }}>
      <div className="max-w-md w-full relative">
        {/* Decorative backdrop */}
        <div className="absolute inset-0 bg-red-500/10 blur-[80px] rounded-full -z-10" />

        <div className="bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Payment <span className="text-red-500">Cancelled</span>
            </h1>
            <p className="text-slate-400">
              {canceled
                ? 'Your payment session was cancelled. No charges were made to your account.'
                : 'The payment process was not completed. You can try again when you are ready.'}
            </p>
          </div>

          <div className="grid gap-4">
            <Link href="/offers">
              <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 h-14 font-bold rounded-xl">
                Return to Offers
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-slate-500 hover:text-white h-12">
                Back to Homepage
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Need assistance? contact our support at{' '}
              <a href="mailto:support@rensto.com" className="text-red-500/80 hover:text-red-500 transition-colors">
                support@rensto.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

