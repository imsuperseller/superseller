import Stripe from 'stripe';
import { auditAgent } from './agents/ServiceAuditAgent';

let stripeInstance: Stripe | null = null;

export function getStripeAdmin(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any
    });
  }
  return stripeInstance;
}

export class StripeApi {
  private stripe: Stripe | null = null;

  private getStripe(): Stripe {
    if (!this.stripe) {
      const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
      if (!apiKey) {
        throw new Error('STRIPE_SECRET_KEY not configured');
      }
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16' as any // Use standard version compatible with current types
      });
    }
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      await auditAgent.log({
        service: 'stripe',
        action: 'create_payment_intent',
        status: 'success',
        details: { amount, currency, paymentIntentId: paymentIntent.id }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };

    } catch (error: any) {
      await auditAgent.log({
        service: 'stripe',
        action: 'create_payment_intent',
        status: 'error',
        errorMessage: error.message,
        details: { amount, currency }
      });
      console.error('Stripe createPaymentIntent error:', error);
      return {
        success: false,
        error: 'Failed to create payment intent'
      };
    }
  }

  async verifyPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      };

    } catch (error) {
      console.error('Stripe verifyPayment error:', error);
      return {
        success: false,
        error: 'Failed to verify payment'
      };
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        status: paymentIntent.status,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      return {
        success: false,
        error: 'Failed to confirm payment'
      };
    }
  }

  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.getStripe().customers.create({
        email,
        name,
        metadata: {
          source: 'superseller-marketplace'
        }
      });

      await auditAgent.log({
        service: 'stripe',
        action: 'create_customer',
        status: 'success',
        details: { email, customerId: customer.id }
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };

    } catch (error: any) {
      await auditAgent.log({
        service: 'stripe',
        action: 'create_customer',
        status: 'error',
        errorMessage: error.message,
        details: { email }
      });
      console.error('Stripe createCustomer error:', error);
      return {
        success: false,
        error: 'Failed to create customer'
      };
    }
  }

  async createProduct(name: string, description: string, unitAmount: number, currency: string = 'usd') {
    try {
      const product = await this.getStripe().products.create({
        name,
        description,
      });

      const priceObject = await this.getStripe().prices.create({
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency,
        product: product.id,
      });

      return {
        success: true,
        productId: product.id,
        priceId: priceObject.id,
        product,
        price: priceObject
      };

    } catch (error) {
      console.error('Stripe createProduct error:', error);
      return {
        success: false,
        error: 'Failed to create product'
      };
    }
  }

  async handleWebhook(payload: string, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      const event = this.getStripe().webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Process webhook event based on type
      let processed = false;
      let processingResult = null;

      switch (event.type) {
        case 'payment_intent.succeeded':
          processed = true;
          processingResult = { type: 'payment_success', eventId: event.id };
          break;
        case 'payment_intent.payment_failed':
          processed = true;
          processingResult = { type: 'payment_failed', eventId: event.id };
          break;
        case 'customer.subscription.created':
          processed = true;
          processingResult = { type: 'subscription_created', eventId: event.id };
          break;
        case 'customer.subscription.updated':
          processed = true;
          processingResult = { type: 'subscription_updated', eventId: event.id };
          break;
        case 'customer.subscription.deleted':
          processed = true;
          processingResult = { type: 'subscription_deleted', eventId: event.id };
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          processed = false;
          processingResult = { type: 'unhandled', eventId: event.id };
      }

      return {
        success: true,
        event,
        result: {
          processed,
          processingResult,
          eventId: event.id,
          eventType: event.type,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Stripe webhook error:', error);
      return {
        success: false,
        error: 'Failed to handle webhook',
        result: {
          processed: false,
          processingResult: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await this.getStripe().refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        metadata: {
          reason: 'customer_request'
        }
      });

      return {
        success: true,
        refundId: refund.id,
        refund
      };

    } catch (error) {
      console.error('Stripe createRefund error:', error);
      return {
        success: false,
        error: 'Failed to create refund'
      };
    }
  }

  async getPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await this.getStripe().paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };

    } catch (error) {
      console.error('Stripe getPaymentMethods error:', error);
      return {
        success: false,
        error: 'Failed to get payment methods'
      };
    }
  }
}