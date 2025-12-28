import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect('/offers');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--rensto-bg-primary)' }}>
      <div className="max-w-xl w-full relative">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full -z-10" />

        <div className="bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl space-y-10 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-pulse" />
            <svg
              className="h-12 w-12 text-cyan-400 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Launch <span className="text-cyan-400">Sequence</span> Started
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Payment confirmed. Our architects are spinning up your dedicated automation environment. Expect a briefing shortly.
            </p>
          </div>

          <div className="bg-[#110d28]/60 rounded-2xl border border-white/5 p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Transaction ID</span>
              <span className="text-xs font-mono text-cyan-400/80 max-w-[150px] truncate">{sessionId}</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Steps</h3>
              <div className="grid gap-3">
                {[
                  'System provisioning (ETA: 2 mins)',
                  'Credentials sent to your email',
                  'Dashboard sync initializing'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                    <span className="text-sm text-slate-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/marketplace" className="w-full">
              <Button className="w-full bg-[#fe3d51] hover:bg-[#ff4d61] text-white h-14 font-bold rounded-xl shadow-[0_0_20px_rgba(254,61,81,0.2)]">
                Go to Marketplace
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full border-slate-700 h-14 font-bold rounded-xl hover:bg-white/5">
                Home Base
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Technical issues? our engineers are online at{' '}
              <a href="mailto:support@rensto.com" className="text-cyan-400/80 hover:text-cyan-400 transition-colors">
                support@rensto.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
