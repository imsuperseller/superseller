/**
 * Stripe Integration for Payment Processing
 * 
 * Implements comprehensive payment processing for marketplace and billing
 * Following BMAD methodology: BUILD phase of TASK 2
 */

import Stripe from 'stripe';

// Initialize Stripe with environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethods: ['card', 'us_bank_account'],
  automaticTax: { enabled: true },
  taxBehavior: 'exclusive' as const,
};

// Product types for marketplace
export enum ProductType {
  TEMPLATE = 'template',
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  USAGE = 'usage'
}

// Pricing models
export enum PricingModel {
  FLAT = 'flat',
  PER_USE = 'per_use',
  TIERED = 'tiered',
  SUBSCRIPTION = 'subscription'
}

// Marketplace product interface
export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  features: string[];
  category: string;
  tags: string[];
  image?: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

// Customer interface
export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  paymentMethodId?: string;
  invoiceSettings?: {
    defaultPaymentMethod?: string;
    customFields?: Array<{ name: string; value: string }>;
  };
}

// Payment session interface
export interface PaymentSession {
  id: string;
  customerId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  stripeSessionId?: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription interface
export interface Subscription {
  id: string;
  customerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  metadata: Record<string, string>;
}

class StripeService {
  /**
   * Create or retrieve Stripe customer
   */
  async createCustomer(customer: Omit<StripeCustomer, 'stripeCustomerId'>): Promise<StripeCustomer> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: customer.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const stripeCustomer = existingCustomers.data[0];
        return {
          ...customer,
          stripeCustomerId: stripeCustomer.id,
        };
      }

      // Create new customer
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          organizationId: customer.organizationId,
        },
        invoice_settings: {
          custom_fields: [
            { name: 'Organization ID', value: customer.organizationId },
          ],
        },
      });

      return {
        ...customer,
        stripeCustomerId: stripeCustomer.id,
      };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create Stripe product and price
   */
  async createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct> {
    try {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          type: product.type,
          category: product.category,
          tags: product.tags.join(','),
        },
        images: product.image ? [product.image] : undefined,
      });

      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(product.price * 100), // Convert to cents
        currency: product.currency,
        recurring: product.pricingModel === PricingModel.SUBSCRIPTION ? {
          interval: 'month',
        } : undefined,
        metadata: {
          pricingModel: product.pricingModel,
        },
      });

      return {
        ...product,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      };
    } catch (error) {
      console.error('Error creating Stripe product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Create checkout session for one-time purchase
   */
  async createCheckoutSession(
    customerId: string,
    productId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      // Get product details (in real implementation, fetch from database)
      const product = await this.getProduct(productId);
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: STRIPE_CONFIG.paymentMethods,
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        automatic_tax: STRIPE_CONFIG.automaticTax,
        tax_behavior: STRIPE_CONFIG.taxBehavior,
        metadata: {
          productId,
          customerId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {}
  ): Promise<Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        id: subscription.id,
        customerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status as Subscription['status'],
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          quantity: item.quantity || 1,
        })),
        metadata: subscription.metadata,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Create usage-based billing
   */
  async createUsageRecord(
    subscriptionItemId: string,
    quantity: number,
    timestamp: number = Math.floor(Date.now() / 1000)
  ): Promise<void> {
    try {
      await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        timestamp,
        action: 'increment',
      });
    } catch (error) {
      console.error('Error creating usage record:', error);
      throw new Error('Failed to create usage record');
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        status: subscription.status as Subscription['status'],
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          quantity: item.quantity || 1,
        })),
        metadata: subscription.metadata,
      };
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        await stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(customerId: string, items: Array<{ priceId: string; quantity: number }>): Promise<Stripe.Invoice> {
    try {
      return await stripe.invoices.create({
        customer: customerId,
        collection_method: 'charge_automatically',
        automatic_tax: STRIPE_CONFIG.automaticTax,
        line_items: items,
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void> {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw new Error('Failed to attach payment method');
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    try {
      const refundData: unknown = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      if (reason) {
        refundData.reason = reason;
      }

      return await stripe.refunds.create(refundData);
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Get product details (mock implementation)
   */
  private async getProduct(productId: string): Promise<MarketplaceProduct> {
    // Mock product data - in real implementation, fetch from database
    const mockProducts: Record<string, MarketplaceProduct> = {
      'template-1': {
        id: 'template-1',
        name: 'Lead Qualification Agent',
        description: 'Automated lead qualification and scoring',
        type: ProductType.TEMPLATE,
        pricingModel: PricingModel.FLAT,
        price: 99.00,
        currency: 'usd',
        features: ['AI-powered scoring', 'CRM integration', 'Email automation'],
        category: 'Sales',
        tags: ['leads', 'automation', 'sales'],
        stripePriceId: 'price_mock_1',
      },
      'subscription-1': {
        id: 'subscription-1',
        name: 'Pro Plan',
        description: 'Professional automation platform',
        type: ProductType.SUBSCRIPTION,
        pricingModel: PricingModel.SUBSCRIPTION,
        price: 299.00,
        currency: 'usd',
        features: ['Unlimited agents', 'Priority support', 'Advanced analytics'],
        category: 'Subscription',
        tags: ['pro', 'unlimited', 'support'],
        stripePriceId: 'price_mock_2',
      },
    };

    const product = mockProducts[productId];
    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Webhook event handlers
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log('Checkout session completed:', session.id);
    // Update order status, grant access to product, etc.
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment succeeded:', invoice.id);
    // Update subscription status, send confirmation email, etc.
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment failed:', invoice.id);
    // Send payment failure notification, update subscription status, etc.
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription created:', subscription.id);
    // Update customer subscription status, send welcome email, etc.
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription updated:', subscription.id);
    // Update subscription details, handle plan changes, etc.
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription deleted:', subscription.id);
    // Update subscription status, revoke access, send cancellation email, etc.
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export types
export type { StripeCustomer, PaymentSession, Subscription };
