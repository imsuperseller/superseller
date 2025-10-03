import Stripe from 'stripe';
import { Customer } from '../models/Customer';
import { Subscription } from '../models/Subscription';
import { Usage } from '../models/Usage';

export class SubscriptionService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  // Subscription Plans Configuration
  private readonly PLANS = {
    basic: {
      name: 'Basic Plan',
      priceId: process.env.STRIPE_BASIC_PRICE_ID!,
      amount: 9700, // $97.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: 100,
        templates: 5,
        support: 'email',
        users: 1,
        apiCalls: 1000,
        storage: 1, // GB
        integrations: 3
      }
    },
    professional: {
      name: 'Professional Plan',
      priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
      amount: 19700, // $197.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: 500,
        templates: 20,
        support: 'priority',
        users: 5,
        apiCalls: 5000,
        storage: 10, // GB
        integrations: 10,
        aiFeatures: true,
        analytics: true
      }
    },
    enterprise: {
      name: 'Enterprise Plan',
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
      amount: 49700, // $497.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: -1, // unlimited
        templates: -1, // unlimited
        support: 'dedicated',
        users: -1, // unlimited
        apiCalls: -1, // unlimited
        storage: -1, // unlimited
        integrations: -1, // unlimited
        aiFeatures: true,
        analytics: true,
        whiteLabel: true,
        customIntegrations: true,
        dedicatedSupport: true
      }
    }
  };

  // Usage-based pricing
  private readonly USAGE_PRICING = {
    apiCalls: 0.01, // $0.01 per API call
    dataProcessing: 0.10, // $0.10 per GB
    customIntegrations: 500, // $500 per custom integration
    additionalStorage: 0.05 // $0.05 per GB
  };

  /**
   * Create a new subscription for a customer
   */
  async createSubscription(customerId: string, planType: 'basic' | 'professional' | 'enterprise', paymentMethodId?: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const plan = this.PLANS[planType];
      
      // Create Stripe customer if not exists
      let stripeCustomerId = customer.stripeCustomerId;
      if (!stripeCustomerId) {
        const stripeCustomer = await this.stripe.customers.create({
          email: customer.email,
          name: customer.name,
          metadata: {
            customerId: customerId,
            company: customer.company
          }
        });
        stripeCustomerId = stripeCustomer.id;
        
        // Update customer with Stripe ID
        await Customer.findByIdAndUpdate(customerId, {
          stripeCustomerId: stripeCustomerId
        });
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          customerId: customerId,
          planType: planType
        }
      });

      // Create local subscription record
      const localSubscription = new Subscription({
        customerId: customerId,
        stripeSubscriptionId: subscription.id,
        planType: planType,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        features: plan.features,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await localSubscription.save();

      return {
        subscription: localSubscription,
        stripeSubscription: subscription,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(subscriptionId: string, newPlanType: 'basic' | 'professional' | 'enterprise') {
    try {
      const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const newPlan = this.PLANS[newPlanType];
      
      // Update Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.stripeSubscriptionId,
          price: newPlan.priceId
        }],
        proration_behavior: 'create_prorations'
      });

      // Update local subscription
      await Subscription.findByIdAndUpdate(subscription._id, {
        planType: newPlanType,
        features: newPlan.features,
        updatedAt: new Date()
      });

      return { success: true, subscription: stripeSubscription };

    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (immediately) {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        // Cancel at period end
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update local subscription
      await Subscription.findByIdAndUpdate(subscription._id, {
        status: immediately ? 'canceled' : 'cancel_at_period_end',
        updatedAt: new Date()
      });

      return { success: true };

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Track usage for billing
   */
  async trackUsage(customerId: string, usageType: 'apiCalls' | 'dataProcessing' | 'storage', amount: number) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const subscription = await Subscription.findOne({ customerId: customerId, status: 'active' });
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Create usage record
      const usage = new Usage({
        customerId: customerId,
        subscriptionId: subscription._id,
        usageType: usageType,
        amount: amount,
        timestamp: new Date()
      });

      await usage.save();

      // Check if usage exceeds plan limits
      const plan = this.PLANS[subscription.planType];
      const limit = plan.features[usageType === 'apiCalls' ? 'apiCalls' : 
                                 usageType === 'dataProcessing' ? 'storage' : 'storage'];

      if (limit !== -1 && amount > limit) {
        // Generate usage-based invoice
        await this.generateUsageInvoice(customerId, usageType, amount - limit);
      }

      return { success: true, usage };

    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  /**
   * Generate usage-based invoice for overages
   */
  private async generateUsageInvoice(customerId: string, usageType: string, overageAmount: number) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer?.stripeCustomerId) {
        throw new Error('Customer or Stripe customer not found');
      }

      const unitPrice = this.USAGE_PRICING[usageType as keyof typeof this.USAGE_PRICING];
      const totalAmount = Math.ceil(overageAmount * unitPrice * 100); // Convert to cents

      const invoice = await this.stripe.invoices.create({
        customer: customer.stripeCustomerId,
        auto_advance: true,
        metadata: {
          customerId: customerId,
          usageType: usageType,
          overageAmount: overageAmount.toString()
        }
      });

      await this.stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        invoice: invoice.id,
        amount: totalAmount,
        currency: 'usd',
        description: `Overage for ${usageType}: ${overageAmount} units`
      });

      await this.stripe.invoices.finalizeInvoice(invoice.id);
      await this.stripe.invoices.pay(invoice.id);

      return invoice;

    } catch (error) {
      console.error('Error generating usage invoice:', error);
      throw error;
    }
  }

  /**
   * Get customer billing portal URL
   */
  async getBillingPortalUrl(customerId: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer?.stripeCustomerId) {
        throw new Error('Customer or Stripe customer not found');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: customer.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/dashboard/billing`
      });

      return session.url;

    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(customerId: string) {
    try {
      const subscription = await Subscription.findOne({ customerId: customerId, status: 'active' });
      if (!subscription) {
        return null;
      }

      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      
      return {
        ...subscription.toObject(),
        stripeSubscription: stripeSubscription
      };

    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };

    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    // Update local subscription status
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: subscription.status, updatedAt: new Date() }
    );
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Update local subscription
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { 
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      }
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Mark subscription as canceled
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: 'canceled', updatedAt: new Date() }
    );
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Update subscription status and send confirmation
    if (invoice.subscription) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription as string },
        { status: 'active', updatedAt: new Date() }
      );
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed payment - send notification, update status
    if (invoice.subscription) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription as string },
        { status: 'past_due', updatedAt: new Date() }
      );
    }
  }
}
