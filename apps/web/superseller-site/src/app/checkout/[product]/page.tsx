import { notFound } from 'next/navigation';
import { getProductConfig } from '@/lib/checkout-config';
import CheckoutForm from './CheckoutForm';

interface PageProps {
  params: Promise<{ product: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { product: productSlug } = await params;
  const productConfig = getProductConfig(productSlug);

  if (!productConfig) {
    notFound();
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';

  return (
    <main className="min-h-screen bg-[#0d1b2e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Super</span>
              <span className="text-[#2563eb]">Seller</span>
              <span className="text-[#f97316] ml-1">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Product Info */}
          <div>
            <div className="bg-[#1e3a8a]/20 border border-[#2563eb]/30 rounded-2xl p-8">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 bg-[#2563eb]/20 text-[#60a5fa] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-Powered Service
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">{productConfig.name}</h1>
              <p className="text-white/70 text-base mb-6">{productConfig.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-extrabold text-white">
                  {productConfig.price.replace('/mo', '')}
                </div>
                <div className="text-white/50 text-sm mt-1">per month, cancel anytime</div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {productConfig.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563eb]/20 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Onboarding highlight */}
              <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                </svg>
                <div>
                  <div className="text-green-400 text-sm font-semibold">WhatsApp Onboarding</div>
                  <div className="text-white/60 text-xs mt-1">
                    Your dedicated AI agent group is created within 30 seconds of payment.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <CheckoutForm
              product={productConfig}
              paypalClientId={paypalClientId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
