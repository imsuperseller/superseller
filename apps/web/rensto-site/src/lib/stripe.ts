import Stripe from 'stripe';

export class StripeApi {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };

    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      return {
        success: false,
        error: 'Failed to create payment intent'
      };
    }
  }

  async verifyPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

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

  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'rensto-marketplace'
        }
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };

    } catch (error) {
      console.error('Stripe createCustomer error:', error);
      return {
        success: false,
        error: 'Failed to create customer'
      };
    }
  }

  async createProduct(name: string, description: string, price: number) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        metadata: {
          type: 'template'
        }
      });

      const priceObject = await this.stripe.prices.create({
        product: product.id,
        unit_amount: price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          type: 'template'
        }
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

      const event = this.stripe.webhooks.constructEvent(
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
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? amount * 100 : undefined, // Convert to cents
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
      const paymentMethods = await this.stripe.paymentMethods.list({
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