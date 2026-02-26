import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { ProvisioningService } from '@/lib/services/ProvisioningService';
import * as dbPayments from '@/lib/db/payments';
import { emails } from '@/lib/email';

/**
 * GET /api/paypal/capture?token=ORDER_ID
 * Called when PayPal redirects after one-time payment approval.
 * Captures the order, provisions the service, and redirects to success page.
 */
export async function GET(req: NextRequest) {
    const orderId = req.nextUrl.searchParams.get('token');
    if (!orderId) {
        return NextResponse.redirect(new URL('/pricing?error=missing_token', req.url));
    }

    try {
        const capture = await captureOrder(orderId);

        if (capture.status !== 'COMPLETED') {
            console.error(`PayPal capture not completed: ${capture.status}`);
            return NextResponse.redirect(new URL('/pricing?error=payment_failed', req.url));
        }

        const metadata = capture.metadata || {};
        const customerEmail = capture.payerEmail?.toLowerCase().trim() || null;
        const userId = customerEmail ? customerEmail.replace(/[^a-z0-9]/g, '_') : 'unknown';

        // Record payment
        await dbPayments.createPayment({
            userId: userId,
            stripeSessionId: orderId, // Reusing column for PayPal order ID
            stripeCustomerId: capture.payerId, // Reusing column for PayPal payer ID
            customerEmail,
            amount: Math.round(capture.amount * 100), // Store as cents for consistency
            amountTotal: Math.round(capture.amount * 100),
            currency: capture.currency.toLowerCase(),
            status: 'completed',
            flowType: metadata.flowType || 'unknown',
            productId: metadata.productId || null,
            tier: metadata.tier || null,
            platform: 'superseller-web',
            metadata: { paypalOrderId: orderId, ...metadata },
        });

        // Provision based on flow type
        if (customerEmail) {
            if (metadata.flowType === 'credit-topup') {
                const creditAmount = parseInt(metadata.creditAmount || '0', 10);
                if (creditAmount > 0) {
                    await ProvisioningService.provisionCredits({
                        email: customerEmail,
                        amount: creditAmount,
                        type: 'credit_topup',
                        stripeSessionId: orderId,
                    });
                    await emails.invoiceReceipt(
                        customerEmail,
                        `${creditAmount} Credits Refill`,
                        capture.amount,
                        orderId
                    );
                }
            } else if (metadata.flowType) {
                await ProvisioningService.provisionService({
                    email: customerEmail,
                    productId: metadata.productId || '',
                    productName: metadata.productName || 'SuperSeller AI Product',
                    flowType: metadata.flowType,
                    stripeSessionId: orderId,
                    metadata,
                });

                if (metadata.flowType === 'marketplace-template') {
                    // Download delivery email is handled in provisioning
                }
            }
        }

        await auditAgent.log({
            service: 'provisioning',
            action: 'paypal_capture_complete',
            status: 'success',
            details: { userId, flowType: metadata.flowType, orderId },
        });

        // Redirect to success page
        const productId = metadata.productId || '';
        const tier = metadata.tier || '';
        const origin = req.nextUrl.origin;
        return NextResponse.redirect(
            new URL(`/success?session_id=${orderId}&product_id=${productId}&tier=${tier}`, origin)
        );
    } catch (err: any) {
        console.error('PayPal capture error:', err);
        await auditAgent.log({
            service: 'paypal',
            action: 'capture_failed',
            status: 'error',
            errorMessage: err.message,
        });
        return NextResponse.redirect(new URL('/pricing?error=capture_failed', req.url));
    }
}
