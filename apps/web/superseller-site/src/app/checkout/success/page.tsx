import Link from 'next/link';

/**
 * /checkout/success — Post-payment confirmation page.
 * Sets expectations for WhatsApp group creation within 30 seconds.
 * Static — no API calls or query param processing.
 */
export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#0d1b2e] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-white">Super</span>
          <span className="text-[#2563eb]">Seller</span>
          <span className="text-[#f97316] ml-1">AI</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
        {/* Green checkmark */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment Confirmed!</h1>

        <p className="text-white/70 text-base leading-relaxed mb-6">
          You'll receive a WhatsApp group invitation within 30 seconds. Check your
          WhatsApp — your dedicated AI assistant is being set up right now.
        </p>

        {/* WhatsApp note */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.533 5.86L0 24l6.335-1.56A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-4.98-1.356l-.356-.214-3.76.924.957-3.665-.234-.373A9.814 9.814 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
          </svg>
          <div>
            <div className="text-green-400 text-sm font-semibold">Check WhatsApp Now</div>
            <div className="text-white/60 text-xs mt-1">
              An invitation to your private AI group will arrive shortly.
            </div>
          </div>
        </div>

        {/* Support fallback */}
        <p className="text-white/40 text-sm">
          If you don't receive the invitation within 2 minutes, contact{' '}
          <a
            href="mailto:support@superseller.agency"
            className="text-[#2563eb] hover:text-[#60a5fa] transition-colors underline underline-offset-2"
          >
            support@superseller.agency
          </a>
        </p>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          &larr; Back to SuperSeller AI
        </Link>
      </div>
    </main>
  );
}
