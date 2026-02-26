/**
 * DEPRECATED: Stripe has been replaced by PayPal (Feb 2026).
 * This file re-exports PayPal functions for backward compatibility
 * with any code that may still import from stripe.ts.
 *
 * All new code should import from '@/lib/paypal' directly.
 */
export {
    createOrder,
    captureOrder,
    createRefund,
} from './paypal';
