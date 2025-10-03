import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Subscription } from '../models/Subscription';
import { Usage } from '../models/Usage';
import { SubscriptionService } from '../services/subscription-service';

export class TenantController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Get tenant information by subdomain
   */
  async getTenant(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      
      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const subscription = await this.subscriptionService.getSubscription(customer._id.toString());
      
      res.json({
        tenant: {
          id: customer._id,
          name: customer.name,
          company: customer.company,
          subdomain: customer.tenant.subdomain,
          customDomain: customer.tenant.customDomain,
          theme: customer.tenant.theme,
          branding: customer.tenant.branding,
          features: customer.tenant.features,
          portalUrl: customer.portalUrl,
          apiEndpoint: customer.apiEndpoint
        },
        subscription: subscription ? {
          planType: subscription.planType,
          status: subscription.status,
          features: subscription.features,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd
        } : null,
        usage: customer.usage,
        success: customer.success
      });

    } catch (error) {
      console.error('Error getting tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      const { theme, branding, features } = req.body;

      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Update tenant configuration
      const updateData: any = {};
      if (theme) updateData['tenant.theme'] = theme;
      if (branding) updateData['tenant.branding'] = branding;
      if (features) updateData['tenant.features'] = features;

      await Customer.findByIdAndUpdate(customer._id, updateData);

      const updatedCustomer = await Customer.findById(customer._id);
      res.json({
        tenant: {
          id: updatedCustomer._id,
          subdomain: updatedCustomer.tenant.subdomain,
          theme: updatedCustomer.tenant.theme,
          branding: updatedCustomer.tenant.branding,
          features: updatedCustomer.tenant.features
        }
      });

    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get tenant usage analytics
   */
  async getUsageAnalytics(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      const { period = '30d' } = req.query;

      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Calculate date range
      const now = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get usage data for the period
      const usageData = await Usage.find({
        customerId: customer._id,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });

      // Aggregate usage by day
      const dailyUsage = usageData.reduce((acc, usage) => {
        const date = usage.timestamp.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            interactions: 0,
            apiCalls: 0,
            dataProcessing: 0,
            storage: 0
          };
        }
        acc[date][usage.usageType] += usage.amount;
        return acc;
      }, {} as Record<string, any>);

      // Calculate trends
      const totalUsage = {
        interactions: usageData.filter(u => u.usageType === 'interactions').reduce((sum, u) => sum + u.amount, 0),
        apiCalls: usageData.filter(u => u.usageType === 'apiCalls').reduce((sum, u) => sum + u.amount, 0),
        dataProcessing: usageData.filter(u => u.usageType === 'dataProcessing').reduce((sum, u) => sum + u.amount, 0),
        storage: usageData.filter(u => u.usageType === 'storage').reduce((sum, u) => sum + u.amount, 0)
      };

      res.json({
        period,
        totalUsage,
        dailyUsage,
        trends: {
          interactions: this.calculateTrend(usageData.filter(u => u.usageType === 'interactions')),
          apiCalls: this.calculateTrend(usageData.filter(u => u.usageType === 'apiCalls')),
          dataProcessing: this.calculateTrend(usageData.filter(u => u.usageType === 'dataProcessing')),
          storage: this.calculateTrend(usageData.filter(u => u.usageType === 'storage'))
        }
      });

    } catch (error) {
      console.error('Error getting usage analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Track usage for billing
   */
  async trackUsage(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      const { usageType, amount } = req.body;

      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Track usage
      await this.subscriptionService.trackUsage(customer._id.toString(), usageType, amount);

      // Update customer usage
      await customer.updateUsage(usageType, amount);

      res.json({ success: true });

    } catch (error) {
      console.error('Error tracking usage:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get tenant health score and recommendations
   */
  async getHealthScore(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;

      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Calculate health score
      const healthScore = customer.calculateHealthScore();
      const churnRisk = customer.assessChurnRisk();

      // Generate recommendations
      const recommendations = this.generateRecommendations(customer, healthScore);

      res.json({
        healthScore,
        churnRisk,
        recommendations,
        lastActiveDate: customer.success.lastActiveDate,
        onboardingCompleted: customer.success.onboardingCompleted,
        expansionOpportunities: customer.success.expansionOpportunities
      });

    } catch (error) {
      console.error('Error getting health score:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get billing portal URL
   */
  async getBillingPortal(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;

      const customer = await Customer.findOne({ 'tenant.subdomain': subdomain });
      if (!customer) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const billingUrl = await this.subscriptionService.getBillingPortalUrl(customer._id.toString());
      res.json({ billingUrl });

    } catch (error) {
      console.error('Error getting billing portal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Calculate usage trend
   */
  private calculateTrend(usageData: any[]) {
    if (usageData.length < 2) return 0;
    
    const firstHalf = usageData.slice(0, Math.floor(usageData.length / 2));
    const secondHalf = usageData.slice(Math.floor(usageData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, u) => sum + u.amount, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, u) => sum + u.amount, 0) / secondHalf.length;
    
    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  }

  /**
   * Generate recommendations based on customer data
   */
  private generateRecommendations(customer: any, healthScore: number) {
    const recommendations = [];

    if (!customer.success.onboardingCompleted) {
      recommendations.push({
        type: 'onboarding',
        priority: 'high',
        title: 'Complete Onboarding',
        description: 'Finish setting up your automation workflows to get the most value from your subscription.',
        action: 'Complete onboarding steps'
      });
    }

    if (customer.usage.interactions < customer.subscription.features.interactions * 0.5) {
      recommendations.push({
        type: 'usage',
        priority: 'medium',
        title: 'Increase Automation Usage',
        description: 'You\'re using less than 50% of your available interactions. Consider adding more automated workflows.',
        action: 'Explore automation templates'
      });
    }

    if (customer.usage.apiCalls > customer.subscription.features.apiCalls * 0.8) {
      recommendations.push({
        type: 'upgrade',
        priority: 'high',
        title: 'Consider Upgrading',
        description: 'You\'re approaching your API call limit. Consider upgrading to a higher plan.',
        action: 'Upgrade subscription'
      });
    }

    if (healthScore < 60) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Improve Engagement',
        description: 'Your account health score is low. Consider reaching out to our support team for assistance.',
        action: 'Contact support'
      });
    }

    return recommendations;
  }
}
