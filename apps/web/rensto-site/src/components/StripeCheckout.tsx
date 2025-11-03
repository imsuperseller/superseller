'use client';

import { useState } from 'react';
// import { useSession } from 'next-auth/react';
import { usePermissions, UserRole } from '@/lib/rbac-client';

interface StripeCheckoutProps {
  productId: string;
  productName: string;
  price: number;
  currency?: string;
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function StripeCheckout({
  productId,
  productName,
  price,
  currency = 'USD',
  onSuccess,
  onCancel,
  className = '',
}: StripeCheckoutProps) {
  // const { data: session } = useSession();
  const session = { user: { name: 'Admin User', email: 'admin@rensto.com' } };
  const userRole = session?.user?.role as UserRole || UserRole.VIEWER;
  const permissions = usePermissions(userRole);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!session) {
      setError('Please log in to make a purchase');
      return;
    }

    if (!permissions.canPurchaseFromMarketplace()) {
      setError('You do not have permission to make purchases');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.rensto.com/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/marketplace`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  if (!session) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-yellow-800 text-sm">
          Please log in to purchase this product.
        </p>
      </div>
    );
  }

  if (!permissions.canPurchaseFromMarketplace()) {
    return (
      <div className={`p-4 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} border border-red-200 rounded-lg ${className}`}>
        <p className="style={{ color: 'var(--rensto-red)' }} text-sm">
          You do not have permission to make purchases.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Product Summary */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900">{productName}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatPrice(price, currency)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Secure payment powered by Stripe
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} border border-red-200 rounded-lg">
          <p className="style={{ color: 'var(--rensto-red)' }} text-sm">{error}</p>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="rensto-animate-glow -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          `Purchase for ${formatPrice(price, currency)}`
        )}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Stripe - PCI DSS Level 1 compliant</p>
      </div>
    </div>
  );
}
