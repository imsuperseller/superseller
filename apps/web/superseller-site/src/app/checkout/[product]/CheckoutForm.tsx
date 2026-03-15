'use client';

import { useEffect, useRef, useState } from 'react';
import { ResolvedCheckoutProduct } from '@/lib/checkout-config';

interface CheckoutFormProps {
  product: ResolvedCheckoutProduct;
  paypalClientId: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function CheckoutForm({ product, paypalClientId }: CheckoutFormProps) {
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRef = useRef<any>(null);

  // Validate form completeness
  const digitsOnly = phone.replace(/\D/g, '');
  const isPhoneValid = digitsOnly.length >= 8;
  const isFormValid = isPhoneValid && businessName.trim().length > 0 && email.trim().length > 0 && email.includes('@');

  function validatePhone(value: string) {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 8) {
      setPhoneError('Please enter at least 8 digits');
    } else {
      setPhoneError('');
    }
  }

  // Load PayPal SDK
  useEffect(() => {
    if (!paypalClientId || !product.paypalPlanId) return;

    const scriptId = 'paypal-sdk-script';
    if (document.getElementById(scriptId)) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => console.error('Failed to load PayPal SDK');
    document.body.appendChild(script);

    return () => {
      // Don't remove — shared across route navigations
    };
  }, [paypalClientId, product.paypalPlanId]);

  // Render PayPal buttons when SDK is loaded and form is valid
  useEffect(() => {
    if (!paypalLoaded || !isFormValid || !paypalRef.current || !window.paypal || !product.paypalPlanId) {
      return;
    }

    // Destroy previous buttons if they exist
    if (paypalButtonsRef.current) {
      try {
        paypalButtonsRef.current.close();
      } catch {
        // ignore
      }
      paypalButtonsRef.current = null;
    }

    // Clear container
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }

    // custom_id is limited to 127 chars by PayPal
    const customIdPayload = JSON.stringify({
      phone: digitsOnly,
      bn: businessName.trim().slice(0, 40),
      svc: product.serviceType.slice(0, 20),
    });

    const buttons = window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe',
      },
      createSubscription: (_data: any, actions: any) => {
        return actions.subscription.create({
          plan_id: product.paypalPlanId,
          custom_id: customIdPayload,
          subscriber: {
            email_address: email.trim(),
          },
        });
      },
      onApprove: (_data: any, _actions: any) => {
        window.location.href = '/checkout/success';
      },
      onError: (err: any) => {
        console.error('PayPal subscription error:', err);
      },
    });

    paypalButtonsRef.current = buttons;
    buttons.render(paypalRef.current);
  }, [paypalLoaded, isFormValid, digitsOnly, businessName, email, product.paypalPlanId, product.serviceType]);

  async function handleStripeCheckout() {
    if (!isFormValid) return;
    setStripeLoading(true);
    setStripeError('');

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          email: email.trim(),
          phone: digitsOnly,
          businessName: businessName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStripeError(data.error || 'Failed to create Stripe session');
        return;
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err: any) {
      setStripeError('Network error. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-2">Complete Your Order</h2>
      <p className="text-white/50 text-sm mb-6">
        Enter your details — your AI agent will be set up immediately after payment.
      </p>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Phone */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-1.5">
            Phone Number <span className="text-[#f97316]">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              validatePhone(e.target.value);
            }}
            onBlur={() => validatePhone(phone)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
          />
          {phoneError && (
            <p className="text-red-400 text-xs mt-1">{phoneError}</p>
          )}
          <p className="text-white/40 text-xs mt-1">
            We'll create your WhatsApp onboarding group at this number
          </p>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-1.5">
            Business Name <span className="text-[#f97316]">*</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your Business Name"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-1.5">
            Email Address <span className="text-[#f97316]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors"
          />
        </div>
      </div>

      {/* Form validation hint */}
      {!isFormValid && (
        <div className="mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 text-xs">
          Complete all fields above to enable payment
        </div>
      )}

      {/* Payment Options */}
      <div className={`space-y-3 transition-opacity duration-200 ${isFormValid ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
          Choose Payment Method
        </div>

        {/* PayPal Button */}
        {product.paypalPlanId && paypalClientId ? (
          <div>
            <div className="text-white/40 text-xs mb-2">PayPal Subscription</div>
            <div ref={paypalRef} className="min-h-[48px]">
              {!paypalLoaded && isFormValid && (
                <div className="bg-[#FFC439] rounded-lg px-4 py-3 text-center text-[#1a1a1a] font-semibold text-sm animate-pulse">
                  Loading PayPal...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-white/30 text-xs italic">PayPal not configured for this product</div>
        )}

        {/* Divider */}
        {product.paypalPlanId && product.stripePriceId && (
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* Stripe Button */}
        {product.stripePriceId ? (
          <div>
            <div className="text-white/40 text-xs mb-2">Credit / Debit Card</div>
            <button
              onClick={handleStripeCheckout}
              disabled={!isFormValid || stripeLoading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {stripeLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay with Card — {product.price}
                </>
              )}
            </button>
            {stripeError && (
              <p className="text-red-400 text-xs mt-2">{stripeError}</p>
            )}
          </div>
        ) : (
          <div className="text-white/30 text-xs italic">Card payment not configured for this product</div>
        )}
      </div>

      {/* Trust Signals */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-4 text-white/30 text-xs">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>Secure checkout powered by PayPal and Stripe</span>
          <div className="w-px h-3 bg-white/10" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
