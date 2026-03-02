import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import prisma from '@/lib/prisma';
import { PRICING_PLANS, CREDIT_COSTS } from '@/data/pricing';

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    product_id?: string;
    tier?: string;
    [key: string]: string | undefined;
  }>;
}

async function getPaymentData(sessionId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripeSessionId: sessionId },
    select: {
      customerEmail: true,
      amount: true,
      tier: true,
      productId: true,
      metadata: true,
      status: true,
    },
  });
  return payment;
}

async function getTenantSlugForEmail(email: string): Promise<string | null> {
  // Find user by email, then look up their tenant via TenantUser join table
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (!user) return null;

  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId: user.id },
    select: { tenantId: true },
  });
  if (!tenantUser) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantUser.tenantId },
    select: { slug: true },
  });

  return tenant?.slug || null;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const tierParam = params.tier;

  if (!sessionId) {
    redirect('/pricing');
  }

  // Fetch payment data
  const payment = await getPaymentData(sessionId).catch(() => null);
  const tier = payment?.tier || tierParam || 'starter';
  const plan = PRICING_PLANS.find((p) => p.id === tier) || PRICING_PLANS[0];
  const amountDollars = payment?.amount ? (payment.amount / 100).toFixed(0) : plan.price.toString();

  // Try to find their tenant/portal
  let portalSlug: string | null = null;
  if (payment?.customerEmail) {
    portalSlug = await getTenantSlugForEmail(payment.customerEmail).catch(() => null);
  }

  // Crew member mapping for what credits buy
  const crewHighlights = [
    { name: 'Forge', action: 'Create a property video', credits: CREDIT_COSTS.forge.credits, icon: '🎬' },
    { name: 'Buzz', action: 'Publish a social post', credits: CREDIT_COSTS.buzz.credits, icon: '📱' },
    { name: 'Scout', action: 'Find a qualified lead', credits: CREDIT_COSTS.scout.credits, icon: '🔍' },
    { name: 'Market', action: 'List on marketplace', credits: CREDIT_COSTS.market.credits, icon: '🏪' },
    { name: 'FrontDesk', action: 'Handle a phone call', credits: CREDIT_COSTS.frontdesk.credits, icon: '📞' },
    { name: 'Cortex', action: 'Answer a question', credits: CREDIT_COSTS.cortex.credits, icon: '🧠' },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'var(--superseller-bg-primary)' }}
    >
      <div className="max-w-2xl w-full relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#f47920]/10 blur-[100px] rounded-full -z-10" />

        <div className="bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-6 sm:p-10 backdrop-blur-xl space-y-8">
          {/* Checkmark + Title */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-green-500/10 border border-green-500/20">
              <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              You&apos;re In.
            </h1>
            <p className="text-lg text-white/60 max-w-md mx-auto">
              Your <span className="text-[#f47920] font-semibold">{plan.name}</span> plan is active.
              Your AI crew is ready to work.
            </p>
          </div>

          {/* Credits Card */}
          <div className="bg-[#0d1b2e]/60 rounded-2xl border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/60 uppercase tracking-wide">Your Credits</span>
              <span className="text-xs text-white/40">${amountDollars}/mo</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#4ecdc4]">{plan.credits.toLocaleString()}</span>
              <span className="text-white/40 text-sm">credits / month</span>
            </div>

            {/* Credit bar */}
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4ecdc4] to-[#f47920]" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-white/40">Full balance loaded. Credits reset each billing cycle.</p>
          </div>

          {/* What Your Credits Buy */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">What Your Credits Buy</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {crewHighlights.map((crew) => (
                <div
                  key={crew.name}
                  className="flex flex-col gap-1 rounded-xl bg-white/[0.03] border border-white/5 p-3 hover:border-white/10 transition-colors"
                >
                  <span className="text-lg">{crew.icon}</span>
                  <span className="text-xs font-medium text-white/80">{crew.action}</span>
                  <span className="text-xs text-[#4ecdc4]">{crew.credits} credits</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start Steps */}
          <div className="bg-[#0d1b2e]/40 rounded-2xl border border-white/5 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Quick Start</h3>
            <div className="space-y-2">
              {[
                { step: 1, text: 'Payment confirmed', done: true },
                { step: 2, text: `${plan.credits.toLocaleString()} credits loaded`, done: true },
                { step: 3, text: 'Open your dashboard and create your first project', done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      item.done
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[#f47920]/20 text-[#f47920] animate-pulse'
                    }`}
                  >
                    {item.done ? '✓' : item.step}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-white/50' : 'text-white font-medium'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={portalSlug ? `/portal/${portalSlug}` : '/pricing'}
              className="flex items-center justify-center h-14 rounded-xl bg-[#f47920] hover:bg-[#f58a30] text-white font-bold text-sm transition-colors shadow-[0_0_20px_rgba(244,121,32,0.2)]"
            >
              {portalSlug ? 'Go to My Dashboard' : 'View Plans'}
            </Link>
            <Link
              href="/crew"
              className="flex items-center justify-center h-14 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 font-bold text-sm transition-colors"
            >
              Meet Your AI Crew
            </Link>
          </div>

          {/* Transaction ID */}
          <div className="text-center">
            <p className="text-xs text-white/30">
              Transaction: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
            <p className="text-xs text-white/30 mt-1">
              Questions?{' '}
              <a href="mailto:support@superseller.agency" className="text-[#4ecdc4]/60 hover:text-[#4ecdc4]">
                support@superseller.agency
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
