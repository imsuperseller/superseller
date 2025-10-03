import Stripe from 'stripe';
import { Customer } from '../models/Customer';
import { Subscription } from '../models/Subscription';
import { Usage } from '../models/Usage';
import { InstantlyCRMService } from './instantly-crm-service';

export class EnhancedBillingService {
  private stripe: Stripe;
  private instantlyCRM: InstantlyCRMService;

  constructor() {
    this.stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2023-10-16',
    });
    this.instantlyCRM = new InstantlyCRMService();
  }

  // Enhanced subscription plans with usage-based pricing
  private readonly ENHANCED_PLANS = {
    basic: {
      name: 'Basic Plan',
      priceId: process.env['STRIPE_BASIC_PRICE_ID']!,
      amount: 9700, // $97.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: 100,
        templates: 5,
        users: 1,
        apiCalls: 1000,
        storage: 1, // GB
        integrations: 3,
        leadGeneration: 50, // leads per month
        crmContacts: 100,
        emailCampaigns: 5
      },
      usagePricing: {
        interactions: 0.50, // $0.50 per interaction over limit
        apiCalls: 0.01, // $0.01 per API call over limit
        storage: 0.05, // $0.05 per GB over limit
        leadGeneration: 2.00, // $2.00 per lead over limit
        crmContacts: 0.10, // $0.10 per contact over limit
        emailCampaigns: 5.00 // $5.00 per campaign over limit
      }
    },
    professional: {
      name: 'Professional Plan',
      priceId: process.env['STRIPE_PROFESSIONAL_PRICE_ID']!,
      amount: 19700, // $197.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: 500,
        templates: 20,
        users: 5,
        apiCalls: 5000,
        storage: 10, // GB
        integrations: 10,
        leadGeneration: 250, // leads per month
        crmContacts: 500,
        emailCampaigns: 20,
        aiFeatures: true,
        analytics: true,
        advancedAutomation: true
      },
      usagePricing: {
        interactions: 0.40, // $0.40 per interaction over limit
        apiCalls: 0.008, // $0.008 per API call over limit
        storage: 0.04, // $0.04 per GB over limit
        leadGeneration: 1.50, // $1.50 per lead over limit
        crmContacts: 0.08, // $0.08 per contact over limit
        emailCampaigns: 4.00 // $4.00 per campaign over limit
      }
    },
    enterprise: {
      name: 'Enterprise Plan',
      priceId: process.env['STRIPE_ENTERPRISE_PRICE_ID']!,
      amount: 49700, // $497.00
      currency: 'usd',
      interval: 'month',
      features: {
        interactions: 2000,
        templates: 100,
        users: 25,
        apiCalls: 20000,
        storage: 50, // GB
        integrations: 50,
        leadGeneration: 1000, // leads per month
        crmContacts: 2000,
        emailCampaigns: 100,
        aiFeatures: true,
        analytics: true,
        advancedAutomation: true,
        whiteLabel: true,
        customIntegrations: true,
        dedicatedSupport: true,
        priorityProcessing: true
      },
      usagePricing: {
        interactions: 0.30, // $0.30 per interaction over limit
        apiCalls: 0.005, // $0.005 per API call over limit
        storage: 0.03, // $0.03 per GB over limit
        leadGeneration: 1.00, // $1.00 per lead over limit
        crmContacts: 0.05, // $0.05 per contact over limit
        emailCampaigns: 3.00 // $3.00 per campaign over limit
      }
    }
  };

  /**
   * Create enhanced subscription with usage tracking
   */
  async createEnhancedSubscription(customerId: string, planType: 'basic' | 'professional' | 'enterprise', paymentMethodId?: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const plan = this.ENHANCED_PLANS[planType];
      
      // Create Stripe customer if not exists
      let stripeCustomerId = customer.billing.stripeCustomerId;
      if (!stripeCustomerId) {
        const stripeCustomer = await this.stripe.customers.create({
          email: customer.email,
          name: customer.name,
          metadata: {
            customerId: customerId,
            company: customer.company,
            subdomain: customer.tenant.subdomain
          }
        });
        stripeCustomerId = stripeCustomer.id;
        
        // Update customer with Stripe ID
        await Customer.findByIdAndUpdate(customerId, {
          'billing.stripeCustomerId': stripeCustomerId
        });
      }

      // Create subscription with usage-based pricing
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          customerId: customerId,
          planType: planType,
          subdomain: customer.tenant.subdomain
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

      // Initialize usage tracking
      await this.initializeUsageTracking(customerId, planType);

      // Set up automated billing workflows
      await this.setupBillingAutomation(customerId, planType);

      return {
        subscription: localSubscription,
        stripeSubscription: subscription,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        usageTracking: {
          initialized: true,
          planLimits: plan.features,
          usagePricing: plan.usagePricing
        }
      };

    } catch (error) {
      console.error('Error creating enhanced subscription:', error);
      throw error;
    }
  }

  /**
   * Track usage with automated billing
   */
  async trackUsageWithBilling(customerId: string, usageData: {
    interactions?: number;
    apiCalls?: number;
    dataProcessing?: number;
    storage?: number;
    leadGeneration?: number;
    crmContacts?: number;
    emailCampaigns?: number;
  }) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const subscription = await Subscription.findOne({ 
        customerId: customerId, 
        status: 'active' 
      });
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      const plan = this.ENHANCED_PLANS[subscription.planType];
      const overages = [];
      let totalOverageCost = 0;

      // Check each usage type for overages
      for (const [usageType, amount] of Object.entries(usageData)) {
        if (amount && amount > 0) {
          // Create usage record
          const usage = new Usage({
            customerId: customerId,
            subscriptionId: subscription._id,
            usageType: usageType,
            amount: amount,
            timestamp: new Date()
          });

          await usage.save();

          // Update customer usage totals
          await Customer.findByIdAndUpdate(customerId, {
            $inc: { [`usage.${usageType}`]: amount }
          });

          // Check for overages
          const limit = plan.features[usageType as keyof typeof plan.features];
          if (limit !== -1 && amount > limit) {
            const overageAmount = amount - limit;
            const overageCost = overageAmount * plan.usagePricing[usageType as keyof typeof plan.usagePricing];
            
            overages.push({
              type: usageType,
              overageAmount,
              overageCost,
              limit
            });
            
            totalOverageCost += overageCost;
          }
        }
      }

      // Generate overage invoice if needed
      if (overages.length > 0) {
        await this.generateOverageInvoice(customerId, overages, totalOverageCost);
      }

      // Check for plan upgrade recommendations
      const upgradeRecommendation = await this.checkUpgradeRecommendation(customerId, subscription.planType);

      return {
        success: true,
        usageTracked: usageData,
        overages: overages.length > 0 ? overages : null,
        overageCost: totalOverageCost,
        upgradeRecommendation,
        currentUsage: await this.getCurrentUsage(customerId)
      };

    } catch (error) {
      console.error('Error tracking usage with billing:', error);
      throw error;
    }
  }

  /**
   * Generate overage invoice
   */
  private async generateOverageInvoice(customerId: string, overages: any[], totalCost: number) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer?.billing.stripeCustomerId) {
        throw new Error('Customer or Stripe customer not found');
      }

      const invoice = await this.stripe.invoices.create({
        customer: customer.billing.stripeCustomerId,
        auto_advance: true,
        metadata: {
          customerId: customerId,
          type: 'usage_overage',
          overages: JSON.stringify(overages)
        }
      });

      // Add overage items to invoice
      for (const overage of overages) {
        await this.stripe.invoiceItems.create({
          customer: customer.billing.stripeCustomerId,
          invoice: invoice.id,
          amount: Math.round(overage.overageCost * 100), // Convert to cents
          currency: 'usd',
          description: `Overage for ${overage.type}: ${overage.overageAmount} units @ $${plan.usagePricing[overage.type]}/unit`
        });
      }

      await this.stripe.invoices.finalizeInvoice(invoice.id);
      await this.stripe.invoices.pay(invoice.id);

      // Send notification to customer
      await this.sendOverageNotification(customer, overages, totalCost);

      return invoice;

    } catch (error) {
      console.error('Error generating overage invoice:', error);
      throw error;
    }
  }

  /**
   * Check for upgrade recommendations
   */
  private async checkUpgradeRecommendation(customerId: string, currentPlan: string) {
    try {
      const currentUsage = await this.getCurrentUsage(customerId);
      const currentPlanData = this.ENHANCED_PLANS[currentPlan as keyof typeof this.ENHANCED_PLANS];
      
      const utilization = {
        interactions: (currentUsage.interactions / currentPlanData.features.interactions) * 100,
        apiCalls: (currentUsage.apiCalls / currentPlanData.features.apiCalls) * 100,
        storage: (currentUsage.storage / currentPlanData.features.storage) * 100,
        leadGeneration: (currentUsage.leadGeneration / currentPlanData.features.leadGeneration) * 100
      };

      // Check if any utilization is consistently over 80%
      const highUtilization = Object.entries(utilization).some(([key, value]) => value > 80);
      
      if (highUtilization) {
        const recommendedPlan = this.getRecommendedPlan(currentPlan);
        const savings = this.calculateSavings(currentPlan, recommendedPlan, currentUsage);
        
        return {
          recommended: true,
          currentPlan,
          recommendedPlan,
          utilization,
          potentialSavings: savings,
          reason: 'High utilization detected - upgrade could reduce overage costs'
        };
      }

      return {
        recommended: false,
        utilization
      };

    } catch (error) {
      console.error('Error checking upgrade recommendation:', error);
      return { recommended: false };
    }
  }

  /**
   * Get current usage for customer
   */
  private async getCurrentUsage(customerId: string) {
    const customer = await Customer.findById(customerId);
    return customer?.usage || {
      interactions: 0,
      apiCalls: 0,
      dataProcessing: 0,
      storage: 0,
      customIntegrations: 0,
      leadGeneration: 0,
      crmContacts: 0,
      emailCampaigns: 0
    };
  }

  /**
   * Get recommended plan based on usage
   */
  private getRecommendedPlan(currentPlan: string) {
    const planHierarchy = ['basic', 'professional', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    
    if (currentIndex < planHierarchy.length - 1) {
      return planHierarchy[currentIndex + 1];
    }
    
    return null;
  }

  /**
   * Calculate potential savings from upgrade
   */
  private calculateSavings(currentPlan: string, recommendedPlan: string | null, currentUsage: any) {
    if (!recommendedPlan) return 0;
    
    const currentPlanData = this.ENHANCED_PLANS[currentPlan as keyof typeof this.ENHANCED_PLANS];
    const recommendedPlanData = this.ENHANCED_PLANS[recommendedPlan as keyof typeof this.ENHANCED_PLANS];
    
    // Calculate current overage costs
    let currentOverageCost = 0;
    for (const [usageType, amount] of Object.entries(currentUsage)) {
      const limit = currentPlanData.features[usageType as keyof typeof currentPlanData.features];
      if (limit !== -1 && amount > limit) {
        const overage = amount - limit;
        currentOverageCost += overage * currentPlanData.usagePricing[usageType as keyof typeof currentPlanData.usagePricing];
      }
    }
    
    // Calculate overage costs with recommended plan
    let recommendedOverageCost = 0;
    for (const [usageType, amount] of Object.entries(currentUsage)) {
      const limit = recommendedPlanData.features[usageType as keyof typeof recommendedPlanData.features];
      if (limit !== -1 && amount > limit) {
        const overage = amount - limit;
        recommendedOverageCost += overage * recommendedPlanData.usagePricing[usageType as keyof typeof recommendedPlanData.usagePricing];
      }
    }
    
    const planPriceDifference = recommendedPlanData.amount - currentPlanData.amount;
    const overageSavings = currentOverageCost - recommendedOverageCost;
    
    return overageSavings - (planPriceDifference / 100); // Convert cents to dollars
  }

  /**
   * Initialize usage tracking for new subscription
   */
  private async initializeUsageTracking(customerId: string, planType: string) {
    try {
      // Reset usage counters
      await Customer.findByIdAndUpdate(customerId, {
        usage: {
          interactions: 0,
          apiCalls: 0,
          dataProcessing: 0,
          storage: 0,
          customIntegrations: 0,
          leadGeneration: 0,
          crmContacts: 0,
          emailCampaigns: 0
        }
      });

      // Set up usage monitoring webhook
      await this.setupUsageMonitoringWebhook(customerId);

    } catch (error) {
      console.error('Error initializing usage tracking:', error);
    }
  }

  /**
   * Set up billing automation workflows
   */
  private async setupBillingAutomation(customerId: string, planType: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) return;

      // Set up automated email sequences for billing
      await this.setupBillingEmailAutomation(customer, planType);
      
      // Set up usage alerts
      await this.setupUsageAlerts(customerId, planType);
      
      // Set up churn prevention workflows
      await this.setupChurnPreventionWorkflows(customerId);

    } catch (error) {
      console.error('Error setting up billing automation:', error);
    }
  }

  /**
   * Set up billing email automation
   */
  private async setupBillingEmailAutomation(customer: any, planType: string) {
    try {
      // Create welcome sequence
      const welcomeSequence = await this.instantlyCRM.createSequence({
        name: `Welcome Sequence - ${customer.company}`,
        steps: [
          {
            step_number: 1,
            subject: 'Welcome to Rensto! Your subscription is active',
            html_content: this.generateWelcomeEmailHTML(customer, planType),
            text_content: this.generateWelcomeEmailText(customer, planType),
            delay_days: 0,
            delay_hours: 0
          },
          {
            step_number: 2,
            subject: 'Getting Started with Your Lead Generation System',
            html_content: this.generateGettingStartedEmailHTML(customer, planType),
            text_content: this.generateGettingStartedEmailText(customer, planType),
            delay_days: 1,
            delay_hours: 0
          },
          {
            step_number: 3,
            subject: 'Maximize Your ROI - Advanced Tips',
            html_content: this.generateAdvancedTipsEmailHTML(customer, planType),
            text_content: this.generateAdvancedTipsEmailText(customer, planType),
            delay_days: 7,
            delay_hours: 0
          }
        ]
      });

      // Add customer to sequence
      await this.instantlyCRM.addContactsToSequence(welcomeSequence.sequenceId, [{
        email: customer.email,
        first_name: customer.name.split(' ')[0],
        last_name: customer.name.split(' ').slice(1).join(' '),
        company: customer.company,
        title: 'Customer',
        source: 'billing_automation'
      }]);

    } catch (error) {
      console.error('Error setting up billing email automation:', error);
    }
  }

  /**
   * Set up usage alerts
   */
  private async setupUsageAlerts(customerId: string, planType: string) {
    try {
      const plan = this.ENHANCED_PLANS[planType as keyof typeof this.ENHANCED_PLANS];
      
      // Create usage monitoring sequence
      const monitoringSequence = await this.instantlyCRM.createSequence({
        name: `Usage Monitoring - ${customerId}`,
        steps: [
          {
            step_number: 1,
            subject: 'Usage Alert: Approaching Plan Limits',
            html_content: this.generateUsageAlertHTML(planType, 80),
            text_content: this.generateUsageAlertText(planType, 80),
            delay_days: 0,
            delay_hours: 0
          },
          {
            step_number: 2,
            subject: 'Usage Alert: Plan Limits Exceeded',
            html_content: this.generateUsageAlertHTML(planType, 100),
            text_content: this.generateUsageAlertText(planType, 100),
            delay_days: 0,
            delay_hours: 0
          }
        ]
      });

      // Store monitoring configuration
      await Customer.findByIdAndUpdate(customerId, {
        'success.expansionOpportunities': [
          'usage_monitoring_configured',
          'billing_automation_active'
        ]
      });

    } catch (error) {
      console.error('Error setting up usage alerts:', error);
    }
  }

  /**
   * Set up churn prevention workflows
   */
  private async setupChurnPreventionWorkflows(customerId: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) return;

      // Create churn prevention sequence
      const churnPreventionSequence = await this.instantlyCRM.createSequence({
        name: `Churn Prevention - ${customer.company}`,
        steps: [
          {
            step_number: 1,
            subject: 'How can we help you succeed?',
            html_content: this.generateChurnPreventionHTML(customer),
            text_content: this.generateChurnPreventionText(customer),
            delay_days: 30,
            delay_hours: 0
          },
          {
            step_number: 2,
            subject: 'Exclusive offer for our valued customers',
            html_content: this.generateExclusiveOfferHTML(customer),
            text_content: this.generateExclusiveOfferText(customer),
            delay_days: 60,
            delay_hours: 0
          }
        ]
      });

    } catch (error) {
      console.error('Error setting up churn prevention workflows:', error);
    }
  }

  /**
   * Set up usage monitoring webhook
   */
  private async setupUsageMonitoringWebhook(customerId: string) {
    // This would typically set up a webhook endpoint to monitor usage in real-time
    // For now, we'll use scheduled checks
    console.log(`Usage monitoring webhook configured for customer ${customerId}`);
  }

  /**
   * Send overage notification
   */
  private async sendOverageNotification(customer: any, overages: any[], totalCost: number) {
    try {
      const campaign = await this.instantlyCRM.createCampaign({
        name: `Overage Notification - ${customer.company}`,
        from_name: 'Rensto Billing Team',
        from_email: 'billing@rensto.com',
        reply_to: 'billing@rensto.com',
        subject: 'Usage Overage Alert - Additional Charges Applied',
        html_content: this.generateOverageNotificationHTML(customer, overages, totalCost),
        text_content: this.generateOverageNotificationText(customer, overages, totalCost)
      });

      await this.instantlyCRM.addLeadsToCampaign(campaign.campaignId, [{
        email: customer.email,
        first_name: customer.name.split(' ')[0],
        last_name: customer.name.split(' ').slice(1).join(' '),
        company: customer.company,
        title: 'Customer',
        source: 'billing_automation'
      }]);

    } catch (error) {
      console.error('Error sending overage notification:', error);
    }
  }

  /**
   * Email template generators
   */
  private generateWelcomeEmailHTML(customer: any, planType: string) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Rensto, ${customer.name}!</h2>
          <p>Your ${planType} subscription is now active and ready to generate leads for your business.</p>
          <p><strong>What's included in your plan:</strong></p>
          <ul>
            <li>Automated lead generation from multiple sources</li>
            <li>CRM integration with instantly.ai</li>
            <li>Advanced analytics and reporting</li>
            <li>Priority support</li>
          </ul>
          <p>Get started by visiting your dashboard: <a href="https://${customer.tenant.subdomain}.rensto.com">${customer.tenant.subdomain}.rensto.com</a></p>
          <p>Best regards,<br>The Rensto Team</p>
        </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(customer: any, planType: string) {
    return `
Welcome to Rensto, ${customer.name}!

Your ${planType} subscription is now active and ready to generate leads for your business.

What's included in your plan:
- Automated lead generation from multiple sources
- CRM integration with instantly.ai
- Advanced analytics and reporting
- Priority support

Get started by visiting your dashboard: https://${customer.tenant.subdomain}.rensto.com

Best regards,
The Rensto Team
    `;
  }

  private generateGettingStartedEmailHTML(customer: any, planType: string) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Getting Started with Your Lead Generation System</h2>
          <p>Hi ${customer.name},</p>
          <p>Here's how to maximize your lead generation:</p>
          <ol>
            <li><strong>Configure your sources:</strong> LinkedIn, Google Maps, Facebook, and more</li>
            <li><strong>Set up your CRM:</strong> Automatically sync leads to instantly.ai</li>
            <li><strong>Create campaigns:</strong> Launch automated email sequences</li>
            <li><strong>Monitor performance:</strong> Track ROI and optimize</li>
          </ol>
          <p>Need help? Our support team is here: support@rensto.com</p>
          <p>Best regards,<br>The Rensto Team</p>
        </body>
      </html>
    `;
  }

  private generateGettingStartedEmailText(customer: any, planType: string) {
    return `
Getting Started with Your Lead Generation System

Hi ${customer.name},

Here's how to maximize your lead generation:

1. Configure your sources: LinkedIn, Google Maps, Facebook, and more
2. Set up your CRM: Automatically sync leads to instantly.ai
3. Create campaigns: Launch automated email sequences
4. Monitor performance: Track ROI and optimize

Need help? Our support team is here: support@rensto.com

Best regards,
The Rensto Team
    `;
  }

  private generateAdvancedTipsEmailHTML(customer: any, planType: string) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Maximize Your ROI - Advanced Tips</h2>
          <p>Hi ${customer.name},</p>
          <p>Here are some advanced strategies to maximize your lead generation ROI:</p>
          <ul>
            <li><strong>Use AI-powered lead scoring</strong> to focus on high-quality prospects</li>
            <li><strong>Set up automated follow-up sequences</strong> to nurture leads</li>
            <li><strong>Integrate with your existing tools</strong> for seamless workflow</li>
            <li><strong>Monitor and optimize</strong> your campaigns regularly</li>
          </ul>
          <p>Ready to upgrade? Contact us for enterprise features: enterprise@rensto.com</p>
          <p>Best regards,<br>The Rensto Team</p>
        </body>
      </html>
    `;
  }

  private generateAdvancedTipsEmailText(customer: any, planType: string) {
    return `
Maximize Your ROI - Advanced Tips

Hi ${customer.name},

Here are some advanced strategies to maximize your lead generation ROI:

- Use AI-powered lead scoring to focus on high-quality prospects
- Set up automated follow-up sequences to nurture leads
- Integrate with your existing tools for seamless workflow
- Monitor and optimize your campaigns regularly

Ready to upgrade? Contact us for enterprise features: enterprise@rensto.com

Best regards,
The Rensto Team
    `;
  }

  private generateUsageAlertHTML(planType: string, percentage: number) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Usage Alert: ${percentage}% of Plan Limits Reached</h2>
          <p>You've used ${percentage}% of your ${planType} plan limits.</p>
          <p>Consider upgrading to avoid overage charges or optimize your usage.</p>
          <p><a href="https://rensto.com/pricing">View Plans</a> | <a href="https://rensto.com/support">Contact Support</a></p>
        </body>
      </html>
    `;
  }

  private generateUsageAlertText(planType: string, percentage: number) {
    return `
Usage Alert: ${percentage}% of Plan Limits Reached

You've used ${percentage}% of your ${planType} plan limits.

Consider upgrading to avoid overage charges or optimize your usage.

View Plans: https://rensto.com/pricing
Contact Support: https://rensto.com/support
    `;
  }

  private generateChurnPreventionHTML(customer: any) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>How can we help you succeed?</h2>
          <p>Hi ${customer.name},</p>
          <p>We want to ensure you're getting maximum value from Rensto. How can we help you succeed?</p>
          <p>Schedule a free consultation: <a href="https://calendly.com/rensto/success">Book Now</a></p>
          <p>Or reply to this email with any questions or concerns.</p>
          <p>Best regards,<br>The Rensto Success Team</p>
        </body>
      </html>
    `;
  }

  private generateChurnPreventionText(customer: any) {
    return `
How can we help you succeed?

Hi ${customer.name},

We want to ensure you're getting maximum value from Rensto. How can we help you succeed?

Schedule a free consultation: https://calendly.com/rensto/success

Or reply to this email with any questions or concerns.

Best regards,
The Rensto Success Team
    `;
  }

  private generateExclusiveOfferHTML(customer: any) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Exclusive Offer for Our Valued Customers</h2>
          <p>Hi ${customer.name},</p>
          <p>As a valued customer, we're offering you an exclusive upgrade discount:</p>
          <ul>
            <li>20% off your next plan upgrade</li>
            <li>Free setup and migration assistance</li>
            <li>Priority support for 3 months</li>
          </ul>
          <p>Contact us to claim your offer: success@rensto.com</p>
          <p>Best regards,<br>The Rensto Team</p>
        </body>
      </html>
    `;
  }

  private generateExclusiveOfferText(customer: any) {
    return `
Exclusive Offer for Our Valued Customers

Hi ${customer.name},

As a valued customer, we're offering you an exclusive upgrade discount:

- 20% off your next plan upgrade
- Free setup and migration assistance
- Priority support for 3 months

Contact us to claim your offer: success@rensto.com

Best regards,
The Rensto Team
    `;
  }

  private generateOverageNotificationHTML(customer: any, overages: any[], totalCost: number) {
    const overageList = overages.map(overage => 
      `<li>${overage.type}: ${overage.overageAmount} units @ $${overage.overageCost.toFixed(2)}</li>`
    ).join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Usage Overage Alert</h2>
          <p>Hi ${customer.name},</p>
          <p>You've exceeded your plan limits and incurred overage charges:</p>
          <ul>${overageList}</ul>
          <p><strong>Total overage cost: $${totalCost.toFixed(2)}</strong></p>
          <p>Consider upgrading your plan to avoid future overage charges.</p>
          <p><a href="https://rensto.com/pricing">View Plans</a></p>
          <p>Best regards,<br>The Rensto Billing Team</p>
        </body>
      </html>
    `;
  }

  private generateOverageNotificationText(customer: any, overages: any[], totalCost: number) {
    const overageList = overages.map(overage => 
      `${overage.type}: ${overage.overageAmount} units @ $${overage.overageCost.toFixed(2)}`
    ).join('\n');

    return `
Usage Overage Alert

Hi ${customer.name},

You've exceeded your plan limits and incurred overage charges:

${overageList}

Total overage cost: $${totalCost.toFixed(2)}

Consider upgrading your plan to avoid future overage charges.

View Plans: https://rensto.com/pricing

Best regards,
The Rensto Billing Team
    `;
  }
}
